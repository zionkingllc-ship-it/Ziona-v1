import { graphqlRequest } from "@/services/graphQL/graphqlClient";
import { BibleBook, BibleTranslation, BibleVerse } from "@/types/bible";

/* =========================
   TRANSLATIONS
========================= */

const GET_TRANSLATIONS = `
query {
  bibleVersions {
    name
  }
}
`;

export async function getBibleTranslations(): Promise<BibleTranslation[]> {
  const data = await graphqlRequest(GET_TRANSLATIONS);

  return (data?.bibleVersions ?? []).map((v: any) => ({
    name: v.name,
  }));
}

/* =========================
   BOOKS
========================= */

const GET_BOOKS = `
query GetBibleBooks($testament: String!) {
  bibleBooks(testament: $testament) {
    name
    slug
    chapters
  }
}
`;

export async function getBibleBooks(): Promise<BibleBook[]> {
  try {
    const [oldRes, newRes] = await Promise.all([
      graphqlRequest(GET_BOOKS, { testament: "old" }),
      graphqlRequest(GET_BOOKS, { testament: "new" }),
    ]);

    const oldBooks = (oldRes?.bibleBooks ?? []).map((b: any) => ({
      name: b.name,
      slug: b.slug,
      chapters: b.chapters,
      testament: "old" as const,
    }));

    const newBooks = (newRes?.bibleBooks ?? []).map((b: any) => ({
      name: b.name,
      slug: b.slug,
      chapters: b.chapters,
      testament: "new" as const,
    }));

    return [...oldBooks, ...newBooks];
  } catch (err) {
    console.log("Failed to load books", err);
    return [];
  }
}

/* =========================
   CHAPTERS
========================= */

export async function getBibleChapters(book: BibleBook): Promise<number[]> {
  return Array.from({ length: book.chapters }, (_, i) => i + 1);
}

/* =========================
   VERSES (CACHE ONLY - NO FETCH)
========================= */

import { queryClient } from "@/lib/queryClient";

export function getBibleVersesFromCache(
  book: string,
  chapter: number,
  version: string
): BibleVerse[] {
  const key = ["scripture", book, chapter, version];

  const data: any = queryClient.getQueryData(key);

  const verses = data?.scripture?.verses;

  if (!Array.isArray(verses)) return [];

  return verses.map((v: any) => ({
    number: v.number,
    text: v.text ?? "",
  }));
}