import { storage } from "./storage";

export type AnchorRefData = {
  type: "text" | "image" | "video";
  title: string;
  content?: string;
  mediaUrl?: string;
  anchorId?: string;
  circleId?: string;
  expiresAt?: string;
  bibleReference?: string;
  bibleText?: string;
  anchorImage?: string;
  anchorVideo?: string;
  backgroundColors?: string;
  backgroundImage?: string;
};

/** Immutable anchor snapshot served by the backend (CirclePost.anchorReference). */
export type ServerAnchorReference = {
  anchorId?: string | null;
  anchorType: string;
  title?: string | null;
  content?: string | null;
  mediaUrl?: string | null;
  backgroundImage?: string | null;
  backgroundColors?: string[] | null;
  bibleReference?: string | null;
  bibleText?: string | null;
};

/**
 * Map the backend snapshot to the local AnchorRefData shape.
 * Server data wins over device storage (survives reinstall/uninstall).
 * Returns null when the snapshot carries nothing renderable.
 */
export function mapServerAnchorReference(
  ref: ServerAnchorReference | null | undefined
): AnchorRefData | null {
  if (!ref) return null;
  const rawType = (ref.anchorType || "").toLowerCase();
  const type: AnchorRefData["type"] =
    rawType === "image" || rawType === "video" ? rawType : "text";
  const content = ref.content?.trim() ? ref.content : undefined;
  const mediaUrl = ref.mediaUrl?.trim() ? ref.mediaUrl : undefined;
  const backgroundImage = ref.backgroundImage?.trim() ? ref.backgroundImage : undefined;
  const bibleText = ref.bibleText?.trim() ? ref.bibleText : undefined;
  const bibleReference = ref.bibleReference?.trim() ? ref.bibleReference : undefined;
  const backgroundColors = ref.backgroundColors?.filter(Boolean).join(",") || undefined;
  if (!content && !mediaUrl && !backgroundImage && !bibleText && !bibleReference) return null;
  return {
    type,
    title: ref.title?.trim() ? ref.title : "Anchor",
    content,
    mediaUrl,
    anchorId: ref.anchorId || undefined,
    bibleReference,
    bibleText,
    backgroundImage,
    backgroundColors,
  };
}

const ANCHOR_REF_PREFIX = "anchorRef_";
const MAX_SAVE_RETRIES = 3;
const RETRY_DELAY_MS = 100;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const ANCHOR_TEXT_PREFIX = "anchorText_";

export async function saveAnchorRef(postId: string, data: AnchorRefData): Promise<void> {
  const key = `${ANCHOR_REF_PREFIX}${postId}`;
  for (let attempt = 1; attempt <= MAX_SAVE_RETRIES; attempt++) {
    try {
      await storage.set(key, data);
      const verify = await storage.get<AnchorRefData>(key);
      if (verify && verify.content === data.content) {
        return;
      }
      console.warn(`[anchorRef] saveAnchorRef verify mismatch for key "${key}", attempt ${attempt}`);
    } catch (error) {
      console.error(`[anchorRef] saveAnchorRef failed for key "${key}", attempt ${attempt}:`, error);
    }
    if (attempt < MAX_SAVE_RETRIES) {
      await sleep(RETRY_DELAY_MS * attempt);
    }
  }
  console.error(`[anchorRef] saveAnchorRef exhausted all retries for key "${key}"`);
}

export async function getAnchorRef(postId: string): Promise<AnchorRefData | null> {
  try {
    return await storage.get<AnchorRefData>(`${ANCHOR_REF_PREFIX}${postId}`);
  } catch (error) {
    console.error(`[anchorRef] getAnchorRef failed for postId "${postId}":`, error);
    return null;
  }
}

export async function saveAnchorText(postId: string, text: string): Promise<void> {
  const key = `${ANCHOR_TEXT_PREFIX}${postId}`;
  for (let attempt = 1; attempt <= MAX_SAVE_RETRIES; attempt++) {
    try {
      await storage.set(key, text);
      const verify = await storage.get<string>(key);
      if (verify === text) {
        return;
      }
      console.warn(`[anchorRef] saveAnchorText verify mismatch for key "${key}", attempt ${attempt}`);
    } catch (error) {
      console.error(`[anchorRef] saveAnchorText failed for key "${key}", attempt ${attempt}:`, error);
    }
    if (attempt < MAX_SAVE_RETRIES) {
      await sleep(RETRY_DELAY_MS * attempt);
    }
  }
  console.error(`[anchorRef] saveAnchorText exhausted all retries for key "${key}"`);
}

export async function getAnchorText(postId: string): Promise<string | null> {
  try {
    return await storage.get<string>(`${ANCHOR_TEXT_PREFIX}${postId}`);
  } catch (error) {
    console.error(`[anchorRef] getAnchorText failed for postId "${postId}":`, error);
    return null;
  }
}

export async function removeAnchorRef(postId: string): Promise<void> {
  try {
    await storage.remove(`${ANCHOR_REF_PREFIX}${postId}`);
    await storage.remove(`${ANCHOR_TEXT_PREFIX}${postId}`);
  } catch (error) {
    console.error(`[anchorRef] removeAnchorRef failed for postId "${postId}":`, error);
  }
}
