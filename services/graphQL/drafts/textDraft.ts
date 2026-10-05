import { TextDraft } from "@/types/createPost";
import { createTextPost } from "../mutation/createPost";

export async function publishTextPost(draft: TextDraft) {
  if (!draft.category?.id) {
    throw new Error("Category is required");
  }

  const basePayload = {
    textMessage: draft.text || null,
    category: draft.category.id,
  };

if (draft.bibleVerse) {
    const verse = draft.bibleVerse;
    const sortedVerses = [...verse.verses].sort((a, b) => a - b);
    const payload = {
      ...basePayload,
      scriptureBook: verse.book,
      scriptureChapter: verse.chapter,
      scriptureVerseStart: sortedVerses[0],
      scriptureVerseEnd: sortedVerses[sortedVerses.length - 1],
      scriptureTranslation: verse.translation,
      bibleMessage: verse.text,
    };

    return createTextPost(payload);
  }

  if (!draft.text?.trim()) {
    throw new Error("Text cannot be empty");
  }

  return createTextPost(basePayload);
}