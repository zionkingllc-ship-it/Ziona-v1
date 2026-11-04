import * as FileSystem from "expo-file-system/legacy";
import { compressImage, convertToSupportedFormat } from "./imageConversion";
import { compressVideo } from "./videoCompression";
import { getMimeType } from "./mime";
import { AppError } from "@/utils/error";

export type PreparedUploadMedia = {
  uri: string;
  fileName: string;
  fileType: string;
  fileSize: number;
};

// Metadata belongs to the resulting file, never to the picker asset before conversion.
export async function prepareUploadMedia(
  uri: string,
  kind: "IMAGE" | "VIDEO",
  mimeType?: string,
): Promise<PreparedUploadMedia> {
  const preparedUri = kind === "IMAGE"
    ? await compressImage(await convertToSupportedFormat(uri, mimeType ?? getMimeType(uri, kind)))
    : await compressVideo(uri);
  const fileName = preparedUri.split(/[?#]/)[0].split("/").pop() ?? "";
  const supported = kind === "IMAGE" ? /\.(jpe?g|png|webp)$/i : /\.(mp4|mov|m4v)$/i;
  if (!supported.test(fileName)) {
    throw new AppError("Could not prepare a supported media file. Please choose another file.", {
      code: "MEDIA_PREPARATION_FAILED", retryable: false,
    });
  }
  const info = await FileSystem.getInfoAsync(preparedUri);
  if (!info.exists || !Number.isFinite(info.size) || info.size <= 0) {
    throw new AppError("The prepared media file is missing or empty. Please select it again.", {
      code: "MEDIA_PREPARATION_FAILED", retryable: false,
    });
  }
  return { uri: preparedUri, fileName, fileType: getMimeType(preparedUri, kind), fileSize: info.size };
}
