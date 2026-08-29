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

export function isHtml(text?: string): boolean {
  return !!text && /<[a-zA-Z][^>]*>/.test(text);
}

function calculateChunkSize(textLength: number): number {
  if (textLength <= 400) return 400;
  if (textLength <= 600) return 500;
  if (textLength <= 900) return 700;
  return 800;
}

/** Splits plain text into character-bounded chunks (legacy behavior). */
export function chunkText(text: string): string[] {
  const chunkSize = calculateChunkSize(text.length);
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > chunkSize) {
    chunks.push(remaining.slice(0, chunkSize));
    remaining = remaining.slice(chunkSize);
  }
  if (remaining.length > 0) chunks.push(remaining);
  return chunks;
}

function plainLength(html: string): number {
  return html.replace(/<[^>]*>/g, "").length;
}

/**
 * Splits an HTML fragment into slide-sized chunks at top-level block
 * boundaries, keeping tags intact. Consecutive blocks are merged until the
 * accumulated plain-text length exceeds `maxChunkChars`.
 */
export function chunkHtmlByBlocks(html: string, maxChunkChars = 700): string[] {
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
  let accLen = 0;

  for (const block of rawBlocks) {
    const len = plainLength(block);
    if (accLen > 0 && accLen + len > maxChunkChars) {
      chunks.push(acc);
      acc = block;
      accLen = len;
    } else {
      acc += block;
      accLen += len;
    }
  }

  if (acc) chunks.push(acc);

  return chunks;
}
