import { CreatePostDraft } from "@/types/createPost";

export const MAX_POST_CHARACTERS = 500;

export function getPostLength(draft: CreatePostDraft) {
  const textLength = draft.text?.length ?? 0;

  const verseLength = draft.bibleVerse?.text.length ?? 0;

  return textLength + verseLength;
}

export function isPostWithinLimit(draft: CreatePostDraft) {
  return getPostLength(draft) <= MAX_POST_CHARACTERS;
}