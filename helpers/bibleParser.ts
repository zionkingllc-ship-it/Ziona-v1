export function formatBibleReference(
  book: string,
  chapter: number,
  verses: number[]
) {
  const verseString =
    verses.length > 1
      ? `${verses[0]}-${verses[verses.length - 1]}`
      : verses[0];

  return `${book} ${chapter}:${verseString}`;
}