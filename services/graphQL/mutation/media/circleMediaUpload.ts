import * as FileSystem from "expo-file-system/legacy";
import {
  requestMediaUpload,
  uploadFileToStorage,
  extractPublicUrl,
} from "@/services/graphQL/mutation/media/mediaUpload";

export async function uploadCircleMedia(
  fileUri: string,
  fileType: string,
): Promise<string> {
  const fileName = fileUri.split("/").pop() || `upload-${Date.now()}`;
  const fileInfo = await FileSystem.getInfoAsync(fileUri);
  if (!fileInfo.exists) {
    throw new Error("File not found");
  }

  const { uploadUrl } = await requestMediaUpload(
    fileName,
    fileType,
    fileInfo.size || 0,
  );

  await uploadFileToStorage(uploadUrl, fileUri, fileType);

  return extractPublicUrl(uploadUrl);
}
