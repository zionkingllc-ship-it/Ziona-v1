import { Image } from "react-native";
import { FeedPost } from "@/types/feedTypes";

/* =========================
   SAFE URL CHECK
========================= */

function isValidStorageUrl(url?: string) {
  if (!url) return false;

  // must be a proper GCS URL
  if (!url.startsWith("https://storage.googleapis.com/")) return false;

  // reject double-prefixed broken URLs
  const count = url.split("https://storage.googleapis.com/").length - 1;

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