import {
  BibleTranslation,
  BibleBook,
  BibleVerse
} from "@/types/bible"

export const MOCK_TRANSLATIONS: BibleTranslation[] = [
  { id: "kjv", name: "KJV" },
  { id: "niv", name: "NIV" },
  { id: "msg", name: "MSG" }
]

export const MOCK_BOOKS: BibleBook[] = [
  { id: "gen", name: "Genesis", testament: "old" },
  { id: "exo", name: "Exodus", testament: "old" },
  { id: "john", name: "John", testament: "new" }
]

export const MOCK_VERSES: BibleVerse[] = [
  {
    number: 1,
    text: "In the beginning was the Word, and the Word was with God..."
  },
  {
    number: 2,
    text: "The same was in the beginning with God."
  },
  {
    number: 3,
    text: "All things were made by him..."
  }
]

export const MOCK_CHAPTERS = Array.from({ length: 21 }, (_, i) => i + 1)