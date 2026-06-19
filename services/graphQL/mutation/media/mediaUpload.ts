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
  const data = await graphqlRequest(REQUEST_UPLOAD_MUTATION, {
    fileName,
    fileType,
    fileSize,
  });

  const payload = data?.uploadMedia;

  if (!payload?.success) {
    console.error("[requestMediaUpload] Server rejected:", JSON.stringify(payload));
    throw new Error(payload?.error?.message || "Media upload request failed");
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
   FILE UPLOAD
   ========================= */

export async function uploadFileToStorage(
  uploadUrl: string,
  fileUri: string,
  fileType: string,
) {
  try {
    const response = await fetch(fileUri);
    const blob = await response.blob();

    const upload = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": fileType,
      },
      body: blob,
    });

    if (!upload.ok) {
      const text = await upload.text().catch(() => "");
      throw new Error(`File upload failed (${upload.status}${text ? ": " + text : ""})`);
    }

    return { size: blob.size };
  } catch (error: any) {
    throw new Error(error.message || "Upload to storage failed");
  }
}
