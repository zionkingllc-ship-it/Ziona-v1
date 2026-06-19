import {
  requestMediaUpload,
  confirmMediaUpload,
} from "@/services/graphQL/mutation/media/mediaUpload";

export async function uploadCircleMedia(
  fileUri: string,
  fileType: string,
): Promise<{ mediaId: string; mediaUrl: string }> {
  const fileName = fileUri.split("/").pop() || `upload-${Date.now()}`;

  // Read the blob to get file size before requesting upload
  let blob: Blob;
  let fileSize: number;
  try {
    const resp = await fetch(fileUri);
    blob = await resp.blob();
    fileSize = blob.size;
  } catch {
    throw new Error("Could not read file");
  }

  if (fileSize <= 0) {
    throw new Error("File is empty");
  }

  const result = await requestMediaUpload(fileName, fileType, fileSize);

  const { uploadUrl, mediaId } = result;

  // Upload file blob to storage, then confirm to trigger processing
  const uploadResp = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": fileType },
    body: blob,
  });

  if (!uploadResp.ok) {
    const text = await uploadResp.text().catch(() => "");
    throw new Error(`File upload failed (${uploadResp.status}${text ? ": " + text : ""})`);
  }

  const { mediaUrl } = await confirmMediaUpload(mediaId);

  return { mediaId, mediaUrl };
}
