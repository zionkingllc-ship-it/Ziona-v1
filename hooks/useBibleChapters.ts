import { useEffect, useState } from "react";
import { bibleRepository } from "../repository";
import type { BibleBook } from "@/types/bible";

export function useBibleChapters(book: BibleBook | null) {
  const [chapters, setChapters] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!book) return;

    bibleRepository.getChapters(book).then((res) => {
      setChapters(res ?? []);
      setLoading(false);
    });
  }, [book]);

  return { chapters, loading };
}