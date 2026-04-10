import { useEffect, useState } from "react";
import { bibleRepository } from "../repository";

export function useBibleChapters(book: string) {
  const [chapters, setChapters] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!book) return;

    bibleRepository.getChapters(book).then((res) => {
      setChapters(res.chapters);
      setLoading(false);
    });
  }, [book]);

  return { chapters, loading };
}