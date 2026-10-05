import { graphqlRequest } from "../../graphqlClient";
import { AppError } from "@/utils/error";

/* SAVE */
export async function savePost(postId: string, folderId?: string) {
  const query = `
    mutation SavePost($postId: String!, $folderId: String) {
      savePost(postId: $postId, folderId: $folderId) {
        success
        stats { savesCount }
        error { code message }
      }
    }
  `;

  const data = await graphqlRequest(query, { postId, folderId });

  const res = data?.savePost;

  if (!res?.success) {
    throw new AppError(res?.error?.message || "Save failed", { code: res?.error?.code });
  }

  return res;
}

/* UNSAVE */
export async function unsavePost(postId: string) {
  const query = `
    mutation UnsavePost($postId: String!) {
      unsavePost(postId: $postId) {
        success
        stats { savesCount }
      }
    }
  `;

  const data = await graphqlRequest(query, { postId });

  const res = data?.unsavePost;

  if (!res?.success) {
    throw new Error("Unsave failed");
  }

  return res;
}
