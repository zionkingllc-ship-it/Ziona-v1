import {
  requestMediaUpload,
  confirmMediaUpload,
} from "@/services/graphQL/mutation/media/mediaUpload";
import { compressImage, convertToSupportedFormat } from "@/services/utils/imageConversion";
import { compressVideo } from "@/services/utils/videoCompression";

function bytesToMB(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(2);
}

async function getFileSize(uri: string): Promise<number> {
  try {
    const { getInfoAsync } = await import("expo-file-system/legacy");
    const info = await getInfoAsync(uri);
    if (info.exists) return info.size;
  } catch { console.warn("[circleMediaUpload] mime type detection failed"); }
  return 0;
}

function mimeFromExtension(uri: string): string {
  const ext = uri.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    heic: "image/jpeg",
    heif: "image/jpeg",
    mp4: "video/mp4",
    mov: "video/mp4",
    m4v: "video/mp4",
    avi: "video/mp4",
  };
  return map[ext] || "application/octet-stream";
}

export async function uploadCircleMedia(
  fileUri: string,
  fileType: string,
): Promise<{ mediaId: string; mediaUrl: string }> {
  let uploadUri = fileUri;
  let uploadType = fileType;

  if (fileType.startsWith("image/")) {
    uploadUri = await convertToSupportedFormat(uploadUri, fileType);
    const beforeSize = await getFileSize(uploadUri);
    uploadUri = await compressImage(uploadUri);
    uploadType = mimeFromExtension(uploadUri);
    const afterSize = await getFileSize(uploadUri);
    console.log(
      `[uploadCircleMedia] image ${beforeSize > 0 ? `${bytesToMB(beforeSize)}MB →` : ""} ${afterSize > 0 ? `${bytesToMB(afterSize)}MB` : "unknown"}${beforeSize > 0 && afterSize > 0 ? ` (${Math.round((1 - afterSize / beforeSize) * 100)}% reduction)` : ""}`,
    );
  } else if (fileType.startsWith("video/")) {
    const beforeSize = await getFileSize(uploadUri);
    uploadUri = await compressVideo(uploadUri);
    uploadType = mimeFromExtension(uploadUri);
    const afterSize = await getFileSize(uploadUri);
    console.log(
      `[uploadCircleMedia] video ${beforeSize > 0 ? `${bytesToMB(beforeSize)}MB →` : ""} ${afterSize > 0 ? `${bytesToMB(afterSize)}MB` : "unknown"}${beforeSize > 0 && afterSize > 0 ? ` (${Math.round((1 - afterSize / beforeSize) * 100)}% reduction)` : ""}`,
    );
  }

  const fileName = uploadUri.split("/").pop() || `upload-${Date.now()}`;

  // Read the blob to get file size before requesting upload
  let blob: Blob;
  let fileSize: number;
  try {
    const resp = await fetch(uploadUri);
    blob = await resp.blob();
    fileSize = blob.size;
  } catch {
    throw new Error("Could not read file");
  }

  if (fileSize <= 0) {
    throw new Error("File is empty");
  }

  const result = await requestMediaUpload(fileName, uploadType, fileSize);

  const { uploadUrl, mediaId } = result;

  // Upload file blob to storage, then confirm to trigger processing
  const uploadResp = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": uploadType },
    body: blob,
  });

  if (!uploadResp.ok) {
    const text = await uploadResp.text().catch(() => "");
    throw new Error(`File upload failed (${uploadResp.status}${text ? ": " + text : ""})`);
  }

  const { mediaUrl } = await confirmMediaUpload(mediaId);

  return { mediaId, mediaUrl };
}
