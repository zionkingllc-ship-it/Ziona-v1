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

export async function saveAnchorRef(postId: string, data: AnchorRefData) {
  await storage.set(`${ANCHOR_REF_PREFIX}${postId}`, data);
}

export async function getAnchorRef(postId: string): Promise<AnchorRefData | null> {
  return storage.get<AnchorRefData>(`${ANCHOR_REF_PREFIX}${postId}`);
}

export async function removeAnchorRef(postId: string) {
  await storage.remove(`${ANCHOR_REF_PREFIX}${postId}`);
}
