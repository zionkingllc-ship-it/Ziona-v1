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
    throw new Error("Media upload request failed");
  }

  return payload;
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
      throw new Error("File upload failed");
    }
  } catch (error: any) {
    throw new Error(error.message || "Upload to storage failed");
  }
}
