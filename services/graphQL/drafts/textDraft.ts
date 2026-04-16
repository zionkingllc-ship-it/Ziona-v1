import { TextDraft } from "@/types/createPost";
import { createTextPost } from "../mutation/createPost";

export async function publishTextPost(draft: TextDraft) {
  if (!draft.category?.id) {
    throw new Error("Category is required");
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
