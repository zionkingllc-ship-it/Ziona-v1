import { TextDraft } from "@/types/createPost";
import { createTextPost, createBiblePost } from "../mutation/createPost";

export async function publishTextPost(draft: TextDraft) {
  if (!draft.category?.id) {
    throw new Error("Category is required");
  }

  if (draft.bibleVerse) {
    const verse = draft.bibleVerse;
    const sortedVerses = [...verse.verses].sort((a, b) => a - b);
    const payload = {
      category: draft.category.id,
      scriptureBook: verse.book,
      scriptureChapter: verse.chapter,
      scriptureVerseStart: sortedVerses[0],
      scriptureVerseEnd: sortedVerses[sortedVerses.length - 1],
      scriptureTranslation: verse.translation,
      bibleMessage: verse.text,
      caption: draft.text || null,
    };

    console.log("TEXT + BIBLE POST INPUT:", payload);
    return createBiblePost(payload);
  }

  if (!draft.text?.trim()) {
    throw new Error("Text cannot be empty");
  }

  const payload = {
    textMessage: draft.text,
    category: draft.category.id,
  };

  console.log("TEXT POST INPUT:", payload);

  return createTextPost(payload);
}
