import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as FileSystem from "expo-file-system/legacy";
import ImageCompressor from "react-native-compressor";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

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

  if (isImageTypeAllowed(mimeType)) {
    console.log(`[convertToSupportedFormat] mimeType "${mimeType}" is allowed, skipping conversion (ext: ${ext})`);
    return uri;
  }

  if (["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(ext)) {
    console.log(`[convertToSupportedFormat] extension "${ext}" is allowed, skipping conversion`);
    return uri;
  }

  console.log(`[convertToSupportedFormat] converting uri=${uri} mimeType=${mimeType} ext=${ext}`);

  try {
    const result = await manipulateAsync(uri, [], {
      format: SaveFormat.JPEG,
      compress: 0.92,
    });
    console.log(`[convertToSupportedFormat] success: ${uri} → ${result.uri}`);
    return result.uri;
  } catch (err) {
    console.error(`[convertToSupportedFormat] failed: uri=${uri} mimeType=${mimeType} ext=${ext} error=`, err);
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
  } catch { console.warn("[imageConversion] exo info extraction failed"); }
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

    const ext = result.split(".").pop()?.toLowerCase() ?? "";
    if (ext === "heic" || ext === "heif") {
      const correctedPath = result.replace(/\.(heic|heif)$/i, ".jpg");
      try {
        await FileSystem.copyAsync({ from: result, to: correctedPath });
        await FileSystem.deleteAsync(result, { idempotent: true });
        return correctedPath;
      } catch {
        return result;
      }
    }

    return result;
  } catch {
    return uri;
  }
}
