import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";

const CACHE_PREFIX = "text_thumb_";
const MIN_PNG_BYTES = 3000;

export async function getCachedThumbnail(
  postId: string
): Promise<string | null> {
  try {
    const uri = await AsyncStorage.getItem(CACHE_PREFIX + postId);
    if (!uri) return null;
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists || (info.size ?? 0) < MIN_PNG_BYTES) {
      await AsyncStorage.removeItem(CACHE_PREFIX + postId);
      return null;
    }
    return uri;
  } catch {
    return null;
  }
}

export async function cacheThumbnail(
  postId: string,
  uri: string
): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_PREFIX + postId, uri);
  } catch {
    /* best-effort */
  }
}
