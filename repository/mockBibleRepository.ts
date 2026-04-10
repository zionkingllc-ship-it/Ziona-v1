import { BibleBook, BibleTranslation, BibleVerse } from "@/types/bible";
import { BibleRepository } from "./bibleRepository";

const OLD_TESTAMENT_COUNT = 39;

export class MockBibleRepository implements BibleRepository {
  async getTranslations(): Promise<BibleTranslation[]> {
    return [{ name: "KJV" }, { name: "ASV" }];
  }

  async getBooks(): Promise<BibleBook[]> {
    const books: BibleBook[] = [
      { name: "Genesis", slug: "genesis", chapters: 50, testament: "old" },
      { name: "Exodus", slug: "exodus", chapters: 40, testament: "old" },
      { name: "John", slug: "john", chapters: 21, testament: "new" },
      { name: "Romans", slug: "romans", chapters: 16, testament: "new" },
    ];

    return books;
  }

  async getChapters(book: BibleBook): Promise<number[]> {
    return Array.from({ length: book.chapters }, (_, i) => i + 1);
  }

  async getVerses(
    translation: string,
    book: string,
    chapter: number,
  ): Promise<BibleVerse[]> {
    return [
      { number: 1, text: `${book} ${chapter}:1 sample text` },
      { number: 2, text: `${book} ${chapter}:2 sample text` },
      { number: 3, text: `${book} ${chapter}:3 sample text` },
    ];
  }
}
