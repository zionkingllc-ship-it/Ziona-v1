import * as FileSystem from "expo-file-system/legacy";
import VideoCompressor from "react-native-compressor";

const MIN_SIZE_FOR_COMPRESS = 10 * 1024 * 1024;

async function getFileSize(uri: string): Promise<number> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) return info.size;
  } catch { console.warn("[videoCompression] exo info extraction failed"); }
  return 0;
}

export async function compressVideo(
  uri: string,
  _quality: number = 0.5,
  onProgress?: (progress: number) => void,
): Promise<string> {
  const beforeSize = await getFileSize(uri);

  if (beforeSize > 0 && beforeSize < MIN_SIZE_FOR_COMPRESS) {
    return uri;
  }

  try {
    const result = await VideoCompressor.Video.compress(
      uri,
      {
        compressionMethod: "auto",
        // Automatic compression chooses its own bitrate.
        minimumFileSizeForCompress: MIN_SIZE_FOR_COMPRESS / (1024 * 1024),
        progressDivider: 10,
      },
      onProgress,
    );

    return result;
  } catch (err) {
    throw new Error(`Video compression failed: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
}
