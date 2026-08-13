import { storage } from "./storage";

const VIEWED_PREFIX = "viewedAnchor_";
const cache: Record<string, boolean> = {};
const listeners = new Set<(id: string) => void>();

export async function markAnchorViewed(anchorId: string) {
  try {
    await storage.set(`${VIEWED_PREFIX}${anchorId}`, true);
    cache[anchorId] = true;
    listeners.forEach((cb) => cb(anchorId));
  } catch (e) {
    // ignore storage errors
  }
}

export async function isAnchorViewed(anchorId: string): Promise<boolean> {
  if (cache[anchorId] === true) return true;
  try {
    const val = await storage.get<boolean>(`${VIEWED_PREFIX}${anchorId}`);
    const res = val === true;
    if (res) cache[anchorId] = true;
    return res;
  } catch {
    return false;
  }
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

export function onAnchorViewed(cb: (id: string) => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
