import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
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

export async function compressImage(uri: string): Promise<string> {
  try {
    const result = await ImageCompressor.Image.compress(uri, {
      compressionMethod: "auto",
      maxWidth: 1920,
    });
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
  try {
    const result = await ImageCompressor.Image.compress(uri, {
      compressionMethod: "manual",
      quality: quality ?? 0.7,
      maxWidth: maxWidth ?? 1920,
    });
    return result;
  } catch {
    return uri;
  }
}
