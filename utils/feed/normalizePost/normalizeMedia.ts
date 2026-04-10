import { buildMediaItem } from "./buildMediaItem";
import { fixMediaUrl } from "./fixMediaUrl";

export function normalizeMedia(p: any, base: any) {

  const caption= p.caption ?? "";
  if (Array.isArray(p.media) && p.media.length > 0) {
    const media = p.media.map(buildMediaItem).filter(Boolean);
   
    if (!media.length) return null;

    const hasVideo = media.some((m: any) => m.type === "video");

    return {
      ...base,
      type: "media",
      mediaType: hasVideo ? "video" : "image",
      caption,
      media,
    };
  }

  if (p.image?.items?.length) {
    const media = p.image.items
      .map((i: any) => buildMediaItem({ ...i, type: "image" }))
      .filter(Boolean);

    if (!media.length) return null;

    return {
      ...base,
      type: "media",
      mediaType: "image",
      caption,
      media,
    };
  }

  if (p.video?.url) {
    const url = fixMediaUrl(p.video.url);
    const rawThumbnail = fixMediaUrl(p.video.thumbnailUrl);

    if (!url) return null;

    const isValidThumbnail =
      rawThumbnail &&
      !rawThumbnail.endsWith(".mp4") &&
      !rawThumbnail.includes(".mp4?");
console.log("[Video Present]", url)
    return {
      ...base,
      type: "media",
      caption,
      mediaType: "video",
      media: [
        {
          type: "video" as const,
          url,
          thumbnailUrl: isValidThumbnail ? rawThumbnail : undefined,
        },
      ],
    };
  }

  return null;
}