export interface BibleTranslation {
  id?: string;
  name: string;
  abbreviation?: string;
  code?: string;
}

export interface BibleBook {
  id?: string;
  name: string;
  slug?: string;
  chapters?: number;
  testament?: "old" | "new";
}

export interface BibleVerse {
  number: number;
  text: string;
}