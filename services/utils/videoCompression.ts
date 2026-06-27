import VideoCompressor from "react-native-compressor";

export type VideoQuality = "low" | "medium" | "high";

const QUALITY_BITRATES: Record<VideoQuality, number | undefined> = {
  low: 500000,
  medium: 1000000,
  high: undefined,
};

export async function compressVideo(
  uri: string,
  quality: VideoQuality = "medium",
  onProgress?: (progress: number) => void,
): Promise<string> {
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
    return result;
  } catch {
    return uri;
  }
}

export async function compressVideoAuto(
  uri: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  try {
    const result = await VideoCompressor.Video.compress(
      uri,
      {
        compressionMethod: "auto",
        minimumFileSizeForCompress: 1,
        progressDivider: 10,
      },
      onProgress,
    );
    return result;
  } catch {
    return uri;
  }
}
