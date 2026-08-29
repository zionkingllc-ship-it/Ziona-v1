import * as FileSystem from "expo-file-system/legacy";
import { graphqlRequest } from "../../graphqlClient";
import { AppError } from "@/utils/error";

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

  if (!payload?.success) {
    console.error("[requestMediaUpload] Server rejected:", JSON.stringify(payload));
    throw new AppError(payload?.error?.message || `Media upload request failed (${fileName}, ${fileType}, ${fileSize})`, { code: payload?.error?.code });
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
    throw new AppError(payload?.error?.message || "Media upload confirmation failed", { code: payload?.error?.code });
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
      if (result?.status === "ready" || result?.status === "completed" || result?.status === "available") {
        statuses.set(id, true);
      } else if (result?.status === "failed") {
        throw new AppError(`Media ${id} processing failed: ${result?.error?.message || "Unknown error"}`);
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

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000];

function isRetryableError(error: any): boolean {
  const msg = error?.message ?? error ?? "";
  return (
    msg.includes("network") ||
    msg.includes("Network") ||
    msg.includes("timeout") ||
    msg.includes("Timeout") ||
    msg.includes("connection") ||
    msg.includes("Connection") ||
    msg.includes("NSURLErrorDomain") ||
    msg.includes("kCFErrorDomain") ||
    msg.includes("ECONNRESET") ||
    msg.includes("ETIMEDOUT") ||
    msg.includes("ENETUNREACH") ||
    msg.includes("socket hang up") ||
    msg.includes("Client network socket")
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function uploadFileToStorage(
  uploadUrl: string,
  fileUri: string,
  fileType: string,
  onProgress?: (percent: number) => void,
  fileSize?: number,
): Promise<{ size: number }> {
  const size = fileSize ?? 0;
  let progressInterval: ReturnType<typeof setInterval> | null = null;

  // Estimate progress based on assumed upload speed
  if (onProgress && size > 0) {
    const ASSUMED_BYTES_PER_SEC = 2 * 1024 * 1024; // 2 MB/s
    const MIN_ESTIMATED_SECONDS = 3; // avoid 0→90 flash for small files
    const estimatedSeconds = Math.max(
      size / ASSUMED_BYTES_PER_SEC,
      MIN_ESTIMATED_SECONDS,
    );
    const startTime = Date.now();
    progressInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const pct = Math.min(Math.round((elapsed / estimatedSeconds) * 90), 90);
      onProgress(pct);
    }, 200);
  }

  function cleanup() {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await FileSystem.uploadAsync(uploadUrl, fileUri, {
        httpMethod: "PUT",
        headers: { "Content-Type": fileType },
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        sessionType: FileSystem.FileSystemSessionType.FOREGROUND,
      });

      if (!result || result.status < 200 || result.status >= 300) {
        throw new Error(`File upload failed (${result?.status ?? "unknown"})`);
      }

      cleanup();
      return { size };
    } catch (error: any) {
      const isLastAttempt = attempt >= MAX_RETRIES;

      if (isLastAttempt || !isRetryableError(error)) {
        cleanup();
        throw new AppError(error.message || "Upload to storage failed");
      }

      const delay = RETRY_DELAYS[attempt] ?? 4000;
      await sleep(delay);
    }
  }

  cleanup();
  throw new Error("Upload to storage failed");
}
