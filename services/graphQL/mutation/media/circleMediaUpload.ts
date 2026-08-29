import {
  requestMediaUpload,
  confirmMediaUpload,
  uploadFileToStorage,
} from "@/services/graphQL/mutation/media/mediaUpload";
import { compressImage, convertToSupportedFormat } from "@/services/utils/imageConversion";
import { compressVideo } from "@/services/utils/videoCompression";

async function getFileSize(uri: string): Promise<number> {
  try {
    const { getInfoAsync } = await import("expo-file-system/legacy");
    const info = await getInfoAsync(uri);
    if (info.exists) return info.size;
  } catch {}
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
    uploadUri = await compressImage(uploadUri);
    uploadType = mimeFromExtension(uploadUri);
  } else if (fileType.startsWith("video/")) {
    uploadUri = await compressVideo(uploadUri);
    uploadType = mimeFromExtension(uploadUri);
  }

  const fileName = uploadUri.split("/").pop() || `upload-${Date.now()}`;
  const fileSize = await getFileSize(uploadUri);

  if (fileSize <= 0) {
    throw new Error("File is empty");
  }

  const result = await requestMediaUpload(fileName, uploadType, fileSize);
  const { uploadUrl, mediaId } = result;

  await uploadFileToStorage(uploadUrl, uploadUri, uploadType, undefined, fileSize);

  const { mediaUrl } = await confirmMediaUpload(mediaId);

  return { mediaId, mediaUrl };
}
