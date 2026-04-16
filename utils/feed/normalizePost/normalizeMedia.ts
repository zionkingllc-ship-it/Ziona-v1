import { buildMediaItem } from "./buildMediaItem";
import { fixMediaUrl } from "./fixMediaUrl";

export function normalizeMedia(p: any, base: any) {
  const caption = p.caption ?? "";

  // Check for raw image.items from GraphQL
  if (p.image?.items?.length) {
    const media = p.image.items
      .map((i: any) => buildMediaItem({ ...i, type: "image" }))
      .filter(Boolean);

    if (!media.length) {
      console.log("[normalizeMedia] ❌ Image items empty, returning null");
      return null;
    }

    return {
      ...base,
      type: "media",
      mediaType: "image",
      caption,
      media,
    };
  }

  // Check for raw video from GraphQL
  if (p.video?.url) {
    const url = fixMediaUrl(p.video.url);
    const rawThumbnail = fixMediaUrl(p.video.thumbnailUrl);

    if (!url) {
      console.log("[normalizeMedia] ❌ Video URL invalid after fixMediaUrl, returning null");
      return null;
    }

    const isValidThumbnail =
      rawThumbnail &&
      !rawThumbnail.endsWith(".mp4") &&
      !rawThumbnail.includes(".mp4?");

    console.log("[normalizeMedia] ✅ Video processed:", {
      url,
      thumbnail: isValidThumbnail ? rawThumbnail : "INVALID/NONE",
      hasThumbnail: !!isValidThumbnail
    });

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

  // Check for pre-normalized media array
  if (Array.isArray(p.media) && p.media.length > 0) {
    const media = p.media.map(buildMediaItem).filter(Boolean);

    if (!media.length) {
      console.log("[normalizeMedia] ❌ Media array empty, returning null");
      return null;
    }

    const hasVideo = media.some((m: any) => m.type === "video");

    return {
      ...base,
      type: "media",
      mediaType: hasVideo ? "video" : "image",
      caption,
      media,
    };
  }

  console.log("[normalizeMedia] ❌ No media found, returning null. Post ID:", p.id, "Type:", p.type);
  return null;
}