import { useEffect, useState } from "react";
import { bibleRepository } from "@/repository";
import { BibleBook } from "@/types/bible";

export function useBibleBooks() {
  const [data, setData] = useState<BibleBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bibleRepository.getBooks().then((res: BibleBook[] | undefined) => {
      setData(res ?? []);
      setLoading(false);
    });
  }, []);

  return { data, loading };
}