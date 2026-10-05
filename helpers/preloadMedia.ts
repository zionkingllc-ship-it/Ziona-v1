import { Image } from "expo-image";
import { FeedPost } from "@/types/feedTypes";

/* =========================
   SAFE URL CHECK
========================= */

function isValidStorageUrl(url?: string) {
  if (!url) return false;

  const STORAGE_BASE = process.env.EXPO_PUBLIC_STORAGE_BASE_URL || "https://storage.googleapis.com";

  // must be a proper GCS URL
  if (!url.startsWith(`${STORAGE_BASE}/`)) return false;

  // reject double-prefixed broken URLs
  const count = url.split(`${STORAGE_BASE}/`).length - 1;

  return count === 1;
}

/* =========================
   SAFE PREFETCH
========================= */

function safePrefetch(url?: string) {
  if (!url) return;

  if (!isValidStorageUrl(url)) return;

  Image.prefetch(url).catch(() => {
    // do nothing
  });
}
/* =========================
   MAIN
========================= */

export function preloadPostMedia(post?: FeedPost) {
  if (!post) return;

  /* ================= MEDIA ================= */
  if (post.type === "media") {
    const first = post.media?.[0];
    if (!first) return;

    safePrefetch(first.url);
    safePrefetch(first.thumbnailUrl);
  }

  /* ================= TEXT / BIBLE ================= */
  if (post.type === "text" || post.type === "bible") {
    return;
  }
}