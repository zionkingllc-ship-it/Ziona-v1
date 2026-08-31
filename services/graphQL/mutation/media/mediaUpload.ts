import * as FileSystem from "expo-file-system/legacy";
import { graphqlRequest } from "../../graphqlClient";
import { AppError } from "@/utils/error";

/* =========================
   STABLE BACKEND ERROR CODES
   ========================= */

const STABLE_ERROR_CODES = new Set([
  "RESUMABLE_UPLOADS_DISABLED",
  "UPLOAD_SESSION_CREATION_FAILED",
  "UPLOAD_GCS_PERMISSION_DENIED",
  "UPLOAD_GCS_TIMEOUT",
  "VIDEO_TOO_LARGE",
  "INVALID_MEDIA_TYPE",
  "INVALID_FILE_SIZE",
]);

function throwIfStableError(payload: any, context: string) {
  const code = payload?.error?.code;
  if (code && STABLE_ERROR_CODES.has(code)) {
    throw new AppError(payload.error.message || `${context} failed`, { code });
  }
}

/* =========================
   RESUMABLE UPLOAD THRESHOLD
   Files larger than this use resumable flow
   ========================= */

export const RESUMABLE_UPLOAD_THRESHOLD = 10 * 1024 * 1024; // 10 MB
export const DEFAULT_CHUNK_SIZE = 8 * 1024 * 1024; // 8 MB (matches backend recommendedChunkSize)

/* =========================
   STANDARD UPLOAD (existing)
   ========================= */

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
    throwIfStableError(payload, "Upload request");
    throw new AppError(payload?.error?.message || `Media upload request failed (${fileName}, ${fileType}, ${fileSize})`, { code: payload?.error?.code });
  }

  return payload as { uploadUrl: string; mediaId: string; mediaUrl?: string; status?: string };
}

/* =========================
   RESUMABLE UPLOAD SESSION
   ========================= */

const CREATE_RESUMABLE_SESSION_MUTATION = `
mutation CreateResumableUploadSession($fileName: String!, $fileType: String!, $fileSize: Int!) {
  createResumableUploadSession(
    fileName: $fileName
    fileType: $fileType
    fileSize: $fileSize
  ) {
    success
    mediaId
    uploadUrl
    resumableUploadUrl
    mediaUrl
    uploadMode
    maxFileSize
    recommendedChunkSize
    error {
      code
      message
    }
  }
}
`;

export type ResumableSession = {
  mediaId: string;
  uploadUrl: string;
  resumableUploadUrl: string;
  mediaUrl?: string;
  uploadMode: string;
  maxFileSize?: number;
  recommendedChunkSize: number;
};

export async function createResumableUploadSession(
  fileName: string,
  fileType: string,
  fileSize: number,
): Promise<ResumableSession> {
  let data: any;
  try {
    data = await graphqlRequest(CREATE_RESUMABLE_SESSION_MUTATION, {
      fileName,
      fileType,
      fileSize,
    });
  } catch (err: any) {
    console.error("[createResumableUploadSession] Network error:", err?.message ?? err);
    throw err;
  }

  const payload = data?.createResumableUploadSession;

  if (!payload?.success) {
    throwIfStableError(payload, "Resumable session creation");
    throw new AppError(
      payload?.error?.message || "Failed to create resumable upload session",
      { code: payload?.error?.code },
    );
  }

  return {
    mediaId: payload.mediaId,
    uploadUrl: payload.uploadUrl,
    resumableUploadUrl: payload.resumableUploadUrl,
    mediaUrl: payload.mediaUrl,
    uploadMode: payload.uploadMode,
    maxFileSize: payload.maxFileSize,
    recommendedChunkSize: payload.recommendedChunkSize || DEFAULT_CHUNK_SIZE,
  };
}

/* =========================
   CONFIRM MEDIA UPLOAD
   ========================= */

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
    throwIfStableError(payload, "Media upload confirmation");
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
   FILE UPLOAD — STANDARD (PUT)
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

/* =========================
   FILE UPLOAD — RESUMABLE (chunked PUT)
   GCS resumable upload protocol:
   1. Initiate: PUT with Content-Length=0 and x-goog-resumable=start
   2. Upload chunks: PUT with Content-Range header
   3. Final chunk completes the upload
   ========================= */

async function readChunk(fileUri: string, offset: number, length: number): Promise<string> {
  // expo-file-system doesn't support partial reads, so we read the whole file
  // and slice. For very large files on mobile, the entire file is accessible
  // via URI and the OS handles paging.
  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
    position: offset,
    length,
  });
  return base64;
}

export async function uploadFileToStorageResumable(
  resumableUploadUrl: string,
  fileUri: string,
  fileType: string,
  fileSize: number,
  onProgress?: (percent: number) => void,
  chunkSize: number = DEFAULT_CHUNK_SIZE,
): Promise<{ size: number }> {
  const totalChunks = Math.ceil(fileSize / chunkSize);
  let uploadedBytes = 0;

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, fileSize);
    const currentChunkSize = end - start;
    const isLastChunk = chunkIndex === totalChunks - 1;

    // Read chunk as base64, then convert to binary for upload
    const base64Data = await readChunk(fileUri, start, currentChunkSize);

    // Convert base64 to binary blob
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const contentRange = `bytes ${start}-${end - 1}/${fileSize}`;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(resumableUploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": fileType,
            "Content-Length": String(currentChunkSize),
            "Content-Range": contentRange,
          },
          body: bytes,
        });

        // 308 Resume Incomplete or 200/201 means chunk accepted
        if (response.status === 308 || response.status === 200 || response.status === 201) {
          uploadedBytes = end;
          const pct = Math.min(Math.round((uploadedBytes / fileSize) * 90), 90);
          onProgress?.(pct);
          break;
        }

        // If we get an error response, try to parse backend error
        if (!response.ok) {
          let errorBody: any;
          try {
            errorBody = await response.json();
          } catch {}
          const errorCode = errorBody?.error?.code || errorBody?.code;
          const errorMessage = errorBody?.error?.message || errorBody?.message || `Chunk upload failed (${response.status})`;

          if (errorCode && STABLE_ERROR_CODES.has(errorCode)) {
            throw new AppError(errorMessage, { code: errorCode });
          }
          throw new AppError(errorMessage);
        }

        uploadedBytes = end;
        onProgress?.(Math.min(Math.round((uploadedBytes / fileSize) * 90), 90));
        break;
      } catch (error: any) {
        const isLastAttempt = attempt >= MAX_RETRIES;
        if (isLastAttempt || !isRetryableError(error)) {
          throw error;
        }
        const delay = RETRY_DELAYS[attempt] ?? 4000;
        await sleep(delay);
      }
    }
  }

  onProgress?.(95);
  return { size: fileSize };
}

/* =========================
   UNIFIED UPLOAD STRATEGY
   Chooses resumable for large files, standard for small
   ========================= */

export type UploadStrategy = {
  useResumable: boolean;
  mediaId: string;
  uploadUrl: string;
  resumableUploadUrl?: string;
  chunkSize: number;
};

export async function requestUploadSession(
  fileName: string,
  fileType: string,
  fileSize: number,
): Promise<UploadStrategy> {
  // Always try resumable first for videos
  const isVideo = fileType.startsWith("video/");
  const isLarge = fileSize > RESUMABLE_UPLOAD_THRESHOLD;

  if (isVideo || isLarge) {
    try {
      const session = await createResumableUploadSession(fileName, fileType, fileSize);
      return {
        useResumable: true,
        mediaId: session.mediaId,
        uploadUrl: session.uploadUrl,
        resumableUploadUrl: session.resumableUploadUrl,
        chunkSize: session.recommendedChunkSize,
      };
    } catch (err: any) {
      // If resumables are disabled or session creation fails, fall back to standard
      if (
        err?.code === "RESUMABLE_UPLOADS_DISABLED" ||
        err?.code === "UPLOAD_SESSION_CREATION_FAILED"
      ) {
        console.warn("[requestUploadSession] Resumable unavailable, falling back to standard:", err.code);
        const standard = await requestMediaUpload(fileName, fileType, fileSize);
        return {
          useResumable: false,
          mediaId: standard.mediaId,
          uploadUrl: standard.uploadUrl,
          chunkSize: 0,
        };
      }
      throw err;
    }
  }

  // Small files or images: use standard upload
  const standard = await requestMediaUpload(fileName, fileType, fileSize);
  return {
    useResumable: false,
    mediaId: standard.mediaId,
    uploadUrl: standard.uploadUrl,
    chunkSize: 0,
  };
}

export async function uploadWithStrategy(
  strategy: UploadStrategy,
  fileUri: string,
  fileType: string,
  fileSize: number,
  onProgress?: (percent: number) => void,
): Promise<{ size: number }> {
  if (strategy.useResumable && strategy.resumableUploadUrl) {
    return uploadFileToStorageResumable(
      strategy.resumableUploadUrl,
      fileUri,
      fileType,
      fileSize,
      onProgress,
      strategy.chunkSize,
    );
  }

  return uploadFileToStorage(strategy.uploadUrl, fileUri, fileType, onProgress, fileSize);
}
