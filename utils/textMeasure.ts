/* =========================
   TEXT MEASURE
   Char limit that weights line breaks as a full visual line (~30 chars),
   so Enter-spam can't bypass the 500-char budget and overflow the feed card.
========================= */

export const TEXT_MAX_LENGTH = 500;

/** One visual line costs ~30 chars (matches card fontSize 17 / lineHeight 25). */
export const NEWLINE_WEIGHT = 30;

function countNewlines(text: string): number {
  if (!text) return 0;
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "\n") count++;
  }
  return count;
}

/**
 * Effective length: raw .length, but each "\n" costs NEWLINE_WEIGHT instead of 1.
 * effectiveLength = text.length + newlineCount * (NEWLINE_WEIGHT - 1)
 */
export function effectiveLength(text: string | undefined | null): number {
  if (!text) return 0;
  return text.length + countNewlines(text) * (NEWLINE_WEIGHT - 1);
}

export function effectiveRemaining(
  text: string | undefined | null,
  verseText: string | undefined | null,
  maxLength: number = TEXT_MAX_LENGTH,
): number {
  return maxLength - (effectiveLength(text) + effectiveLength(verseText));
}

export function isWithinLimit(
  text: string | undefined | null,
  verseText: string | undefined | null,
  maxLength: number = TEXT_MAX_LENGTH,
): boolean {
  return effectiveLength(text) + effectiveLength(verseText) <= maxLength;
}

/**
 * Safety net for display (incl. legacy spam posts already in backend):
 * collapse 3+ consecutive newlines to a single blank line, trim edges.
 */
export function sanitizeForDisplay(text: string | undefined | null): string {
  if (!text) return "";
  return text.replace(/\n{3,}/g, "\n\n").trim();
}
