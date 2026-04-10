import {
  BibleBook,
  BibleTranslation,
  BibleVerse,
} from "@/types/bible";

export interface BibleRepository {
  getTranslations(): Promise<BibleTranslation[]>;

  getBooks(): Promise<BibleBook[]>;

  getChapters(book: BibleBook): Promise<number[]>;

  getVerses(
    translation: string,
    book: string,
    chapter: number
  ): Promise<BibleVerse[]>;
}