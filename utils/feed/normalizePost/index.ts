import { FeedPost } from "@/types/feedTypes";
import { normalizeBase } from "./normalizeBase";
import { normalizeMedia } from "./normalizeMedia";
import { normalizeText } from "./normalizeText";
import { normalizeBible } from "./normalizeBible";

export function normalizePost(p: any): FeedPost | null {
  if (!p?.id || !p?.type) return null;

  const base = normalizeBase(p);

  const type = typeof p.type === "string" ? p.type.toUpperCase() : p.type;

  if (type === "MEDIA") {
    return normalizeMedia(p, base);
  }

  if (type === "TEXT") {
    return normalizeText(p, base);
  }

  if (type === "BIBLE") {
    return normalizeBible(p, base);
  }

  return null;
}
