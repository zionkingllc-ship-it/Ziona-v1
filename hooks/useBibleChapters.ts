import { useEffect, useState } from "react";
import { bibleRepository } from "../repository";
import type { BibleBook } from "@/types/bible";

export function useBibleChapters(book: string) {
  const [chapters, setChapters] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!book) return;

    bibleRepository.getChapters(book as unknown as BibleBook).then((res: BibleBook | undefined) => {
      setChapters(res?.chapters ?? 0);
      setLoading(false);
    });
  }, [book]);

  return { chapters, loading };
}