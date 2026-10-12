import { publishBiblePost } from "./drafts/bibleDraft";
import { publishMediaPost } from "./drafts/mediaDraft";
import { publishTextPost } from "./drafts/textDraft";

import { CreatePostDraft } from "@/types/createPost";

import { QueryClient } from "@tanstack/react-query";

export async function publishDraftPost(
  draft: CreatePostDraft,
  queryClient: QueryClient
) {
  if (!draft) {
    throw new Error("Draft is missing");
  }

  if (draft.type === "TEXT") {
    return publishTextPost(draft);
  }

  if (draft.type === "MEDIA") {
    return publishMediaPost(draft, queryClient);  
  }

  if (draft.type === "BIBLE") {
    return publishBiblePost(draft);
  }

  throw new Error("Invalid draft type");
}