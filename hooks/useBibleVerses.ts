import { useEffect, useState } from "react";
import { bibleRepository } from "@/repository";
import { BibleVerse } from "@/types/bible";

export function useBibleVerses(
  translation: string,
  book: string,
  chapter: number
) {
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!translation || !book || !chapter) return;

    bibleRepository
      .getVerses(translation, book, chapter)
      .then((res) => {
        setVerses(res);
        setLoading(false);
      });
  }, [translation, book, chapter]);

  return { verses, loading };
}