import {
  requestUploadSession,
  uploadWithStrategy,
  confirmMediaUpload,
} from "@/services/graphQL/mutation/media/mediaUpload";
import { prepareUploadMedia } from "@/services/utils/prepareUploadMedia";

export async function uploadCircleMedia(
  fileUri: string,
  fileType: string,
): Promise<{ mediaId: string; mediaUrl: string }> {
  if (!fileType.startsWith("image/") && !fileType.startsWith("video/")) {
    throw new Error("Please choose a supported image or video.");
  }
  const { uri: uploadUri, fileType: uploadType, fileName, fileSize } = await prepareUploadMedia(
    fileUri, fileType.startsWith("image/") ? "IMAGE" : "VIDEO", fileType,
  );

  const result = await requestUploadSession(fileName, uploadType, fileSize);

  await uploadWithStrategy(result, uploadUri, uploadType, fileSize);

  const { mediaUrl } = await confirmMediaUpload(result.mediaId);

  return { mediaId: result.mediaId, mediaUrl };
}
