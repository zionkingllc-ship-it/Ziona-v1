export function normalizeText(p: any, base: any) {
  const message =
    typeof p.textMessage === "string" && p.textMessage.trim()
      ? p.textMessage
      : typeof p.text === "string" && p.text.trim()
        ? p.text
        : "";

  if (!message) return null;

  return {
    ...base,
    type: "text",
    textMessage: message,
    scripture: p.scripture
      ? {
          book: p.scripture.book,
          chapter: p.scripture.chapter,
          verseStart: p.scripture.verseStart,
          verseEnd: p.scripture.verseEnd,
          translation: p.scripture.translation,
          text: p.scripture.text,
        }
      : undefined,
  };
}