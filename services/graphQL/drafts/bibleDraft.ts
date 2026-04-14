import { BibleDraft } from "@/types/createPost";
import { createBiblePost } from "../mutation/createPost";

export async function publishBiblePost(draft: BibleDraft) {
  console.log("━━━━━━━━ PUBLISH BIBLE START ━━━━━━━━");
  console.log("Draft received:", draft);

  if (!draft.category?.id) {
    throw new Error("Category is required");
  }

  if (!draft.bibleVerse) {
    throw new Error("Bible verse is required");
  }

  const verse = draft.bibleVerse;

  const input: {
    category: string;
    scriptureBook: string;
    scriptureChapter: number;
    scriptureVerseStart: number;
    scriptureTranslation: string;
    scriptureVerseEnd?: number;
  } = {
    category: draft.category.id,
    scriptureBook: verse.book,
    scriptureChapter: verse.chapter,
    scriptureVerseStart: verse.verses?.[0],
    scriptureTranslation: verse.translation,
  };

  if (verse.verses?.length > 1) {
    input.scriptureVerseEnd = verse.verses[verse.verses.length - 1];
  }

  console.log("FINAL INPUT TO createBiblePost:", input);

  try {
    const response = await createBiblePost(input);

    console.log("Bible post created successfully:", response);
    console.log("━━━━━━━━ PUBLISH BIBLE END ━━━━━━━━");

    return response;
  } catch (err) {
    console.error("CreateBiblePost failed with input:", input);
    console.error("Error:", err);
    throw err;
  }
}
