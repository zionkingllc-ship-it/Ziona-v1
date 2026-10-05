const BLOCK_TAGS = new Set([
  "p",
  "div",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "table",
  "section",
  "article",
  "br",
  "hr",
]);

const CHARS_PER_LINE = 18;
const MAX_LINES = 15;
const MAX_CHARS = CHARS_PER_LINE * MAX_LINES;

export function isHtml(text?: string): boolean {
  return !!text && /<[a-zA-Z][^>]*>/.test(text);
}

/** Estimates rendered line count for a plain text string. */
function estimateLines(characterCount: number): number {
  return Math.ceil(characterCount / CHARS_PER_LINE);
}

/** Splits plain text into line-bounded chunks. */
export function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > MAX_CHARS) {
    chunks.push(remaining.slice(0, MAX_CHARS));
    remaining = remaining.slice(MAX_CHARS);
  }
  if (remaining.length > 0) chunks.push(remaining);
  return chunks;
}

function plainLength(html: string): number {
  return html.replace(/<[^>]*>/g, "").length;
}

/** Strips <img> and <video> tags from HTML so media doesn't duplicate when a dedicated image/video slide exists. */
export function stripMediaFromHtml(html: string): string {
  return html.replace(/<img\b[^>]*\/?>/gi, "").replace(/<video\b[^>]*>[\s\S]*?<\/video>/gi, "");
}

/**
 * Splits an HTML fragment into slide-sized chunks at top-level block
 * boundaries, keeping tags intact. Consecutive blocks are merged until the
 * estimated rendered line count exceeds MAX_LINES.
 */
export function chunkHtmlByBlocks(html: string): string[] {
  if (!isHtml(html)) return [html];

  const n = html.length;
  const rawBlocks: string[] = [];
  let current = "";
  let depth = 0;
  let i = 0;

  while (i < n) {
    if (html[i] === "<") {
      const end = html.indexOf(">", i);
      if (end === -1) {
        current += html.slice(i);
        break;
      }
      const tag = html.slice(i, end + 1);
      const isClosing = tag.startsWith("</");
      const isSelfClose =
        tag.endsWith("/>") ||
        /^(?:<\s*(?:br|hr|img|input|meta|link)\b)/i.test(tag);
      const nameMatch = tag.match(/<\/?\s*([a-zA-Z0-9]+)/);
      const name = nameMatch ? nameMatch[1].toLowerCase() : "";
      const isBlock = BLOCK_TAGS.has(name);

      current += tag;

      if (!isClosing && !isSelfClose) depth += 1;
      else if (isClosing) depth = Math.max(0, depth - 1);

      if (depth === 0 && isClosing && isBlock) {
        if (current.trim().length > 0) {
          rawBlocks.push(current.trim());
          current = "";
        }
      }

      i = end + 1;
    } else {
      const next = html.indexOf("<", i);
      current += next === -1 ? html.slice(i) : html.slice(i, next);
      i = next === -1 ? n : next;
    }
  }

  if (current.trim().length > 0) rawBlocks.push(current.trim());

  if (rawBlocks.length <= 1) return rawBlocks;

  const chunks: string[] = [];
  let acc = "";
  let accLines = 0;

  for (const block of rawBlocks) {
    const blockLines = estimateLines(plainLength(block));
    const spacingLines = acc.length > 0 ? 0.5 : 0;

    if (acc.length > 0 && accLines + spacingLines + blockLines > MAX_LINES) {
      chunks.push(acc);
      acc = block;
      accLines = blockLines;
    } else {
      acc += block;
      accLines += spacingLines + blockLines;
    }
  }

  if (acc) chunks.push(acc);

  return chunks;
}
