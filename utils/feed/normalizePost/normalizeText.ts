export function normalizeText(p: any, base: any) {
  console.log("🔍 normalizeText INPUT:", JSON.stringify({
    id: p.id,
    type: p.type,
    textMessage: p.textMessage,
    scripture: p.scripture,
  }, null, 2));

  const message =
    typeof p.textMessage === "string" && p.textMessage.trim()
      ? p.textMessage
      : typeof p.bibleMessage === "string" && p.bibleMessage.trim()
        ? p.bibleMessage
        : typeof p.text === "string" && p.text.trim()
          ? p.text
          : "";

  if (!message && !p.scripture) return null;

  // Handle both single `text` and `verses[]` array from API
  const verseText =
    p.scripture?.text ??
    (p.scripture?.verses?.map((v: any) => v.text).join(" ") ?? "");

  const result = {
    ...base,
    type: "text",
    textMessage: message,
    scripture: p.scripture
      ? {
          reference: p.scripture.reference,
          book: p.scripture.book,
          chapter: p.scripture.chapter,
          verseStart: p.scripture.verseStart,
          verseEnd: p.scripture.verseEnd,
          translation: p.scripture.translation,
          text: verseText,
        }
      : undefined,
  };

  console.log("🔍 normalizeText OUTPUT:", JSON.stringify(result, null, 2));
  return result;
}