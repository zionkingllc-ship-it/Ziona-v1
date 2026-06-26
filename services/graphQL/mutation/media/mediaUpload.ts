import * as FileSystem from "expo-file-system/legacy";
import { graphqlRequest } from "../../graphqlClient";

const REQUEST_UPLOAD_MUTATION = `
mutation UploadMedia($fileName: String!, $fileType: String!, $fileSize: Int!) {
  uploadMedia(
    fileName: $fileName
    fileType: $fileType
    fileSize: $fileSize
  ) {
    success
    uploadUrl
    mediaId
    mediaUrl
    status
  }
}
`;

export async function requestMediaUpload(
  fileName: string,
  fileType: string,
  fileSize: number,
) {
  let data: any;
  console.log("[requestMediaUpload] Requesting upload:", { fileName, fileType, fileSize });
  try {
    data = await graphqlRequest(REQUEST_UPLOAD_MUTATION, {
      fileName,
      fileType,
      fileSize,
    });
  } catch (err: any) {
    console.error("[requestMediaUpload] Network error:", err?.message ?? err);
    throw err;
  }

  const payload = data?.uploadMedia;
  console.log("[requestMediaUpload] Server response:", JSON.stringify(payload));

  if (!payload?.success) {
    console.error("[requestMediaUpload] Server rejected:", JSON.stringify(payload));
    throw new Error(payload?.error?.message || `Media upload request failed (${fileName}, ${fileType}, ${fileSize})`);
  }

  return payload as { uploadUrl: string; mediaId: string; mediaUrl?: string; status?: string };
}

const CONFIRM_MEDIA_UPLOAD = `
mutation ConfirmMediaUpload($mediaId: String!) {
  confirmMediaUpload(mediaId: $mediaId) {
    success
    mediaUrl
    error {
      code
      message
    }
  }
}
`;

export async function confirmMediaUpload(mediaId: string) {
  const data = await graphqlRequest(CONFIRM_MEDIA_UPLOAD, { mediaId });
  const payload = data?.confirmMediaUpload;

  if (!payload?.success) {
    throw new Error(payload?.error?.message || "Media upload confirmation failed");
  }

  return payload as { mediaUrl: string };
}

const STORAGE_BASE = process.env.EXPO_PUBLIC_STORAGE_BASE_URL || "https://storage.googleapis.com";

export function extractPublicUrl(uploadUrl: string) {
  const url = new URL(uploadUrl);
  let path = url.pathname;
  if (path.startsWith("/")) path = path.slice(1);
  return `${STORAGE_BASE}/${path}`;
}

/* =========================
   MEDIA STATUS QUERY
   ========================= */

const MEDIA_STATUS_QUERY = `
query MediaStatus($mediaId: String!) {
  mediaStatus(mediaId: $mediaId) {
    success
    mediaId
    mediaUrl
    status
    thumbnailUrl
    error {
      code
      message
    }
  }
}
`;

export async function checkMediaStatus(mediaId: string) {
  const data = await graphqlRequest(MEDIA_STATUS_QUERY, { mediaId });
  return data?.mediaStatus;
}

export async function waitForMediaProcessing(
  mediaIds: string[],
  maxAttempts = 60,
  initialDelay = 500,
): Promise<void> {
  const statuses = new Map<string, boolean>();
  mediaIds.forEach((id) => statuses.set(id, false));

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const pendingIds = mediaIds.filter((id) => !statuses.get(id));
    if (pendingIds.length === 0) return;

    const results = await Promise.all(
      pendingIds.map((id) => checkMediaStatus(id).then((result) => ({ id, result }))),
    );

    for (const { id, result } of results) {
      console.log("[waitForMediaProcessing] mediaId:", id, "status:", result?.status, "success:", result?.success, "mediaUrl:", !!result?.mediaUrl);
      if (result?.status === "ready" || result?.status === "completed" || result?.status === "available") {
        statuses.set(id, true);
      } else if (result?.status === "failed") {
        throw new Error(`Media ${id} processing failed: ${result?.error?.message || "Unknown error"}`);
      } else {
        statuses.set(id, false);
      }
    }

    const readyCount = mediaIds.filter((id) => statuses.get(id)).length;
    if (readyCount === mediaIds.length) return;

    const delay = Math.min(initialDelay * Math.pow(1.5, attempt), 8000);
    await new Promise((r) => setTimeout(r, delay));
  }

  const stillPending = mediaIds.filter((id) => !statuses.get(id));
  throw new Error(`Media processing timed out for IDs: ${stillPending.join(", ")}`);
}

/* =========================
   FILE UPLOAD (with size-based progress estimate)
   ========================= */

export function uploadFileToStorage(
  uploadUrl: string,
  fileUri: string,
  fileType: string,
  onProgress?: (percent: number) => void,
  fileSize?: number,
): Promise<{ size: number }> {
  return new Promise(async (resolve, reject) => {
    const size = fileSize ?? 0;
    let settled = false;
    let progressInterval: ReturnType<typeof setInterval> | null = null;

    function done(err?: any, result?: { size: number }) {
      if (settled) return;
      settled = true;
      if (progressInterval) clearInterval(progressInterval);
      if (err) reject(err);
      else resolve(result!);
    }

    try {
      // Estimate progress based on assumed upload speed
      if (onProgress && size > 0) {
        const ASSUMED_BYTES_PER_SEC = 2 * 1024 * 1024; // 2 MB/s
        const estimatedSeconds = size / ASSUMED_BYTES_PER_SEC;
        const startTime = Date.now();
        progressInterval = setInterval(() => {
          const elapsed = (Date.now() - startTime) / 1000;
          const pct = Math.min(Math.round((elapsed / estimatedSeconds) * 90), 90);
          onProgress(pct);
        }, 200);
      }

      const result = await FileSystem.uploadAsync(uploadUrl, fileUri, {
        httpMethod: "PUT",
        headers: { "Content-Type": fileType },
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        sessionType: FileSystem.FileSystemSessionType.FOREGROUND,
      });

      if (settled) return;

      if (!result || result.status < 200 || result.status >= 300) {
        done(new Error(`File upload failed (${result?.status ?? "unknown"})`));
      } else {
        done(undefined, { size });
      }
    } catch (error: any) {
      done(new Error(error.message || "Upload to storage failed"));
    }
  });
}
