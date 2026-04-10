// import { TextDraft } from "@/types/createPost";
// import { createTextPost } from "../mutation/createTextPost";

// export async function publishTextPost(draft: TextDraft) {
//   if (!draft.category?.id) {
//     throw new Error("Category is required");
//   }

//   if (!draft.text?.trim()) {
//     throw new Error("Text cannot be empty");
//   }

//   const bible = draft.bibleVerse;
//   const hasBible = !!bible && Array.isArray(bible.verses) && bible.verses.length > 0;

//   /* =========================
//      DERIVE START / END
//   ========================= */

//   let verseStart: number | undefined;
//   let verseEnd: number | undefined;

//   if (hasBible) {
//     const sorted = [...bible.verses].sort((a, b) => a - b);

//     verseStart = sorted[0];
//     verseEnd = sorted.length > 1 ? sorted[sorted.length - 1] : undefined;
//   }

//   const input = {
//     postType: "TEXT" as const,
//     message: draft.text,
//     category: String(draft.category.id),

//     scriptureBook: hasBible ? bible.book : undefined,
//     scriptureChapter: hasBible ? bible.chapter : undefined,
//     scriptureVerseStart: verseStart,
//     scriptureVerseEnd: verseEnd,
//     scriptureTranslation: hasBible ? bible.translation : undefined,
//   };

//   console.log("TEXT INPUT:", input);

//   return await createTextPost(input);
// }   


import { createTextPost } from "../mutation/createTextPost";
import { TextDraft } from "@/types/createPost";

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
    payload.scriptureVerseEnd =
      bible.verses[bible.verses.length - 1];
  }

  console.log("FINAL INPUT TO createPost:", payload);

  return createTextPost(payload);
}