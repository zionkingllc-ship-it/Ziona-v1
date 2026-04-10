export function normalizeBible(p: any, base: any) {
  if (!p.scripture) return null;

  return {
    ...base,
    type: "bible",
    scripture: {
      book: p.scripture.book,
      chapter: p.scripture.chapter,
      verseStart: p.scripture.verseStart,
      verseEnd: p.scripture.verseEnd,
      translation: p.scripture.translation,
      text: p.scripture.text,
    },
  };
}