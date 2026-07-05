import * as FileSystem from "expo-file-system/legacy";
import VideoCompressor from "react-native-compressor";

export type VideoQuality = "low" | "medium" | "high";

const QUALITY_BITRATES: Record<VideoQuality, number | undefined> = {
  low: 300000,
  medium: 500000,
  high: 1500000,
};

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

export async function compressVideo(
  uri: string,
  quality: VideoQuality = "medium",
  onProgress?: (progress: number) => void,
): Promise<string> {
  const beforeSize = await getFileSize(uri);

  try {
    const result = await VideoCompressor.Video.compress(
      uri,
      {
        compressionMethod: "manual",
        bitrate: QUALITY_BITRATES[quality],
        minimumFileSizeForCompress: 1,
        progressDivider: 10,
      },
      onProgress,
    );

    const afterSize = await getFileSize(result);
    console.log(
      `[compressVideo] (${quality}) ${beforeSize > 0 ? `${bytesToMB(beforeSize)}MB →` : ""} ${afterSize > 0 ? `${bytesToMB(afterSize)}MB` : "unknown"}${beforeSize > 0 && afterSize > 0 ? ` (${Math.round((1 - afterSize / beforeSize) * 100)}% reduction)` : ""}`,
    );

    return result;
  } catch {
    return uri;
  }
}
