import * as VideoThumbnails from "expo-video-thumbnails";
import { Asset } from "expo-asset";

/* =========================
   FIX BAD URLS
========================= */

function fixMediaUrl(url?: string): string | undefined {
  if (!url) return undefined;

  const base = (process.env.EXPO_PUBLIC_STORAGE_BASE_URL || "https://storage.googleapis.com") + "/";
  const parts = url.split(base);

  // handle duplicated prefix issue
  if (parts.length > 2) {
    return base + parts.pop();
  }

  return url;
}

/* =========================
   GENERATE THUMBNAIL
========================= */

export async function generateVideoThumbnail(
  videoSource: string | number
): Promise<string | null> {
  try {
    let uri: string | undefined;

    /* ================= LOCAL ASSET ================= */
    if (typeof videoSource === "number") {
      const asset = Asset.fromModule(videoSource);
      await asset.downloadAsync();
      uri = asset.localUri ?? asset.uri;
    }

    /* ================= REMOTE URL ================= */
    else if (typeof videoSource === "string") {
      uri = fixMediaUrl(videoSource);
    }

    /* ================= SAFETY ================= */
    if (!uri || typeof uri !== "string") {
      return null;
    }

    // extra guard: must look like a valid video URL
    if (!uri.startsWith("http") && !uri.startsWith("file")) {
      return null;
    }

    /* ================= GENERATE ================= */
    const { uri: thumbnailUri } =
      await VideoThumbnails.getThumbnailAsync(uri, {
        time: 1000,
      });

    if (!thumbnailUri) {
      return null;
    }

    return thumbnailUri;
  } catch (error) {
    console.warn("Thumbnail generation failed:", error);
    return null;
  }
}