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
};

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
