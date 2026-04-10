import { fixMediaUrl } from "./fixMediaUrl";

export function buildMediaItem(m: any): {
  type: "image" | "video";
  url: string;
  thumbnailUrl?: string;
  
} | null {
  const url = fixMediaUrl(m?.url);
  if (!url) return null;

  const rawThumb = fixMediaUrl(m?.thumbnailUrl);

  const isValidThumb =
    rawThumb &&
    !rawThumb.endsWith(".mp4") &&
    !rawThumb.includes(".mp4?");

  const isVideo =
    url.includes(".mp4") ||
    url.includes(".mov") ||
    url.includes(".m3u8");

  return {
    type: isVideo ? "video" : "image",
    url,
    thumbnailUrl: isValidThumb ? rawThumb : undefined,
  };
}