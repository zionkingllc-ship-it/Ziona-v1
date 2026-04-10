import { graphqlRequest } from "@/services/graphQL/graphqlClient";
import { BibleBook, BibleTranslation, BibleVerse } from "@/types/bible";
import { BibleRepository } from "../bibleRepository";

import {
  getBibleBooks,
  getBibleTranslations,
} from "@/services/bible/bibleService";

export class GraphqlBibleRepository implements BibleRepository {
  async getTranslations(): Promise<BibleTranslation[]> {
    return getBibleTranslations();
  }

  async getBooks(): Promise<BibleBook[]> {
    return getBibleBooks();
  }

  async getChapters(book: BibleBook): Promise<number[]> {
    return Array.from({ length: book.chapters }, (_, i) => i + 1);
  }

  /* =========================
     SINGLE SOURCE OF TRUTH
  ========================= */

  async getScripture(params: {
    book: string;
    chapter: number;
    version: string;
  }) {
    const QUERY = `
query GetFullChapter($book: String!, $chapter: Int!, $translation: String!) {
  scripture(
    book: $book
    chapter: $chapter
    translation: $translation
  ) {
    book
    chapter
    verses {
      number
      text
    }
  }
}
`;

    const variables = {
      book: params.book,
      chapter: params.chapter,
      translation: params.version,
    };
    const data = await graphqlRequest(QUERY, variables);

    if (!data?.scripture) {
      console.warn("No scripture returned from backend");
      return null;
    }

    return data.scripture;
  }

  /* =========================
     REQUIRED BY INTERFACE (PURE)
  ========================= */

  async getVerses(
    translation: string,
    book: string,
    chapter: number,
  ): Promise<BibleVerse[]> {
    const scripture = await this.getScripture({
      book,
      chapter,
      version: translation,
    });

    if (!scripture?.verses) return [];

    return scripture.verses.map((v: any) => ({
      number: v.number,
      text: v.text ?? "",
    }));
  }
}
