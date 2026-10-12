import { normalizeIncomingLink } from "@/lib/incomingLink";

export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  return normalizeIncomingLink(path);
}
