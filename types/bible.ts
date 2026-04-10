export interface BibleTranslation {
  name: string;
}

export interface BibleBook {
  name: string;
  slug: string;
  chapters: number;
  testament: "old" | "new";
}

export interface BibleVerse {
  number: number;
  text: string;
}