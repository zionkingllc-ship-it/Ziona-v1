import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import ImageCompressor from "react-native-compressor";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function isImageTypeAllowed(mimeType?: string): boolean {
  if (!mimeType) return false;
  return ALLOWED_IMAGE_TYPES.includes(mimeType);
}

function getExtension(uri: string): string {
  const match = uri.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/);
  return match?.[1]?.toLowerCase() ?? "unknown";
}

export async function convertToSupportedFormat(
  uri: string,
  mimeType?: string,
): Promise<string> {
  const ext = getExtension(uri);

  const needsConversion = ["heic", "heif"].includes(ext) || ["image/heic", "image/heif"].includes(mimeType ?? "");
  if (!needsConversion && isImageTypeAllowed(mimeType)) {
    return uri;
  }

  if (!needsConversion && ["jpg", "jpeg", "png", "webp"].includes(ext)) {
    return uri;
  }

  try {
    const result = await manipulateAsync(uri, [], {
      format: SaveFormat.JPEG,
      compress: 0.92,
    });
    return result.uri;
  } catch (err) {
    console.error(`[convertToSupportedFormat] failed: uri=${uri} mimeType=${mimeType} ext=${ext} error=`, err);
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

    const ext = result.split(".").pop()?.toLowerCase() ?? "";
    if (ext === "heic" || ext === "heif") {
      return await convertToSupportedFormat(result, `image/${ext}`);
    }

    return result;
  } catch (err) {
    throw new Error(`Image compression failed: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
}
