export function normalizeBible(p: any, base: any) {
  console.log("🔍 normalizeBible INPUT:", JSON.stringify({
    id: p.id,
    type: p.type,
    textMessage: p.textMessage,
    bibleMessage: p.bibleMessage,
    scripture: p.scripture,
  }, null, 2));

  if (!p.scripture) return null;

  const verseText = p.scripture.text ?? p.scripture.verses?.map((v: any) => v.text).join(" ") ?? "";

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

  console.log("🔍 normalizeBible OUTPUT:", JSON.stringify(result, null, 2));
  return result;
}