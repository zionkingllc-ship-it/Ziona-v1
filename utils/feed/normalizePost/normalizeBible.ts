export function normalizeBible(p: any, base: any) {
  if (!p.scripture) return null;

  // Handle both single `text` and `verses[]` array from API
  const verseText =
    p.scripture.text ??
    (p.scripture.verses?.map((v: any) => `(${v.number}) ${v.text}`).join(" ") ?? "");

  const result = {
    ...base,
    type: "bible",
    textMessage: p.bibleMessage || p.textMessage || undefined,
    scripture: {
      reference: p.scripture.reference,
      book: p.scripture.book,
      chapter: p.scripture.chapter,
      verseStart: p.scripture.verseStart,
      verseEnd: p.scripture.verseEnd,
      translation: p.scripture.translation,
      text: verseText,
    },
  };

  return result;
}