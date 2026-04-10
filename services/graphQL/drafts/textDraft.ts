import { TextDraft } from "@/types/createPost";
import { createTextPost } from "../mutation/text/createTextPost";

export async function publishTextPost(draft: TextDraft) {
  if (!draft.category?.id) {
    throw new Error("Category is required");
  }

  if (!draft.text?.trim()) {
    throw new Error("Text cannot be empty");
  }

  const bible = draft.bibleVerse;

  const payload: any = {
    category: draft.category.id,
    postType: "TEXT",

    message: draft.text.trim(),
  };

  // optional scripture
  if (bible?.book && bible?.chapter && bible?.verses?.length) {
    payload.scriptureBook = bible.book;
    payload.scriptureChapter = bible.chapter;
    payload.scriptureTranslation = bible.translation;
    payload.scriptureVerseStart = bible.verses[0];
    payload.scriptureVerseEnd = bible.verses[bible.verses.length - 1];
  }

  console.log("FINAL INPUT TO createPost:", payload);

  return createTextPost(payload);
}
