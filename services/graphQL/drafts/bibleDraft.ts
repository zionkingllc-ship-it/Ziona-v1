import { createTextPost } from "../mutation/createTextPost";
import { BibleDraft } from "@/types/createPost";

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

  const input: any = {
    postType: "BIBLE", 
    category: String(draft.category.id),

    scriptureBook: verse.book,
    scriptureChapter: verse.chapter,
    scriptureVerseStart: verse.verses?.[0],
    scriptureTranslation: verse.translation,
  };

  if (verse.verses?.length > 1) {
    input.scriptureVerseEnd =
      verse.verses[verse.verses.length - 1];
  }

  console.log("FINAL INPUT TO createPost:", input);

  try {
    const response = await createTextPost(input);

    console.log("Bible post created successfully:", response);
    console.log("━━━━━━━━ PUBLISH BIBLE END ━━━━━━━━");

    return response;
  } catch (err) {
    console.error("CreatePost failed with input:", input);
    console.error("Error:", err);
    throw err;
  }
}
