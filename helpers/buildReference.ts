export function buildReference(
  book: string,
  chapter: number,
  verses: number[]
) {
  const sorted = [...verses].sort((a, b) => a - b);

  if (sorted.length === 1) {
    return `${book} ${chapter}:${sorted[0]}`;
  }

  return `${book} ${chapter}:${sorted[0]}-${sorted[sorted.length - 1]}`;
}