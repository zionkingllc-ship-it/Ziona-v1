import { FeedPost } from "@/types/feedTypes";
import { normalizeBase } from "./normalizeBase";
import { normalizeMedia } from "./normalizeMedia";
import { normalizeText } from "./normalizeText";
import { normalizeBible } from "./normalizeBible";

export function normalizePost(p: any): FeedPost | null {
  if (!p?.id || !p?.type) {
    console.log("[normalizePost] ❌ Missing id or type:", { id: p?.id, type: p?.type });
    return null;
  }

  const base = normalizeBase(p);

  const type = typeof p.type === "string" ? p.type.toUpperCase() : p.type;
  console.log("[normalizePost] Processing post:", p.id, "Type:", p.type, "-> Normalized:", type);

  if (type === "MEDIA") {
    return normalizeMedia(p, base);
  }

  // For TEXT type posts (including text + bible), use normalizeText
  if (type === "TEXT") {
    return normalizeText(p, base);
  }

  // For BIBLE type posts (dedicated bible flow), use normalizeBible
  if (type === "BIBLE") {
    return normalizeBible(p, base);
  }

  console.log("[normalizePost] ❌ Unknown type:", type, "Post ID:", p.id);
  return null;
}
