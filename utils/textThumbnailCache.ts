import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_PREFIX = "text_thumb_";

export async function getCachedThumbnail(
  postId: string
): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(CACHE_PREFIX + postId);
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
