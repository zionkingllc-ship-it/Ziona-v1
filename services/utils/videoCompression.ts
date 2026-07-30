import * as FileSystem from "expo-file-system/legacy";
import VideoCompressor from "react-native-compressor";

const MIN_SIZE_FOR_COMPRESS = 10 * 1024 * 1024;

function bytesToMB(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(2);
}

async function getFileSize(uri: string): Promise<number> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) return info.size;
  } catch { console.warn("[videoCompression] exo info extraction failed"); }
  return 0;
}

export async function compressVideo(
  uri: string,
  quality: number = 0.5,
  onProgress?: (progress: number) => void,
): Promise<string> {
  const beforeSize = await getFileSize(uri);

  if (beforeSize > 0 && beforeSize < MIN_SIZE_FOR_COMPRESS) {
    console.log(
      `[compressVideo] Skipped (${bytesToMB(beforeSize)}MB < 10MB)`,
    );
    return uri;
  }

  try {
    const result = await VideoCompressor.Video.compress(
      uri,
      {
        compressionMethod: "auto",
        quality,
        minimumFileSizeForCompress: MIN_SIZE_FOR_COMPRESS,
        progressDivider: 10,
      },
      onProgress,
    );

    const afterSize = await getFileSize(result);
    console.log(
      `[compressVideo] (${quality}) ${beforeSize > 0 ? `${bytesToMB(beforeSize)}MB →` : ""} ${afterSize > 0 ? `${bytesToMB(afterSize)}MB` : "unknown"}${beforeSize > 0 && afterSize > 0 ? ` (${Math.round((1 - afterSize / beforeSize) * 100)}% reduction)` : ""}`,
    );

    const ext = result.split(".").pop()?.toLowerCase() ?? "";
    if (ext === "mov" || ext === "avi" || ext === "m4v") {
      const correctedPath = result.replace(/\.(mov|avi|m4v)$/i, ".mp4");
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
