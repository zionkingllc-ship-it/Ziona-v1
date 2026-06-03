import { storage } from "./storage";

const VIEWED_PREFIX = "viewedAnchor_";

export async function markAnchorViewed(anchorId: string) {
  await storage.set(`${VIEWED_PREFIX}${anchorId}`, true);
}

export async function isAnchorViewed(anchorId: string): Promise<boolean> {
  const val = await storage.get<boolean>(`${VIEWED_PREFIX}${anchorId}`);
  return val === true;
}

export async function getViewedStatus(anchorIds: string[]): Promise<Record<string, boolean>> {
  const entries = await Promise.all(
    anchorIds.map(async (id) => {
      const viewed = await isAnchorViewed(id);
      return [id, viewed] as const;
    })
  );
  return Object.fromEntries(entries);
}
