import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as FileSystem from "expo-file-system/legacy";
import ImageCompressor from "react-native-compressor";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function isImageTypeAllowed(mimeType?: string): boolean {
  if (!mimeType) return false;
  return ALLOWED_IMAGE_TYPES.includes(mimeType);
}

export async function convertToSupportedFormat(
  uri: string,
  mimeType?: string,
): Promise<string> {
  if (isImageTypeAllowed(mimeType)) return uri;

  try {
    const result = await manipulateAsync(uri, [], {
      format: SaveFormat.JPEG,
      compress: 0.92,
    });
    return result.uri;
  } catch {
    throw new Error(
      `Could not convert image to a supported format. Only JPEG, PNG, and WebP are allowed.`,
    );
  }
}

function bytesToMB(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(2);
}

async function getFileSize(uri: string): Promise<number> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) return info.size;
  } catch {}
  return 0;
}

export async function compressImage(uri: string): Promise<string> {
  const beforeSize = await getFileSize(uri);

  try {
    const result = await ImageCompressor.Image.compress(uri, {
      compressionMethod: "auto",
      maxWidth: 1920,
    });

    const afterSize = await getFileSize(result);
    console.log(
      `[compressImage] ${beforeSize > 0 ? `${bytesToMB(beforeSize)}MB →` : ""} ${afterSize > 0 ? `${bytesToMB(afterSize)}MB` : "unknown"}${beforeSize > 0 && afterSize > 0 ? ` (${Math.round((1 - afterSize / beforeSize) * 100)}% reduction)` : ""}`,
    );

    return result;
  } catch {
    return uri;
  }
}

export async function compressImageManual(
  uri: string,
  quality?: number,
  maxWidth?: number,
): Promise<string> {
  const beforeSize = await getFileSize(uri);

  try {
    const result = await ImageCompressor.Image.compress(uri, {
      compressionMethod: "manual",
      quality: quality ?? 0.7,
      maxWidth: maxWidth ?? 1920,
    });

    const afterSize = await getFileSize(result);
    console.log(
      `[compressImageManual] ${beforeSize > 0 ? `${bytesToMB(beforeSize)}MB →` : ""} ${afterSize > 0 ? `${bytesToMB(afterSize)}MB` : "unknown"}${beforeSize > 0 && afterSize > 0 ? ` (${Math.round((1 - afterSize / beforeSize) * 100)}% reduction)` : ""}`,
    );

    return result;
  } catch {
    return uri;
  }
}
