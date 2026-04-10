import { graphqlRequest } from "../graphqlClient";
import { getToken } from "./token";

/* SAVE */
export async function savePost(postId: string, folderId?: string) {
  const token = getToken();

  const query = `
    mutation SavePost($postId: String!, $folderId: String) {
      savePost(postId: $postId, folderId: $folderId) {
        success
        stats { savesCount }
        error { code message }
      }
    }
  `;

  const data = await graphqlRequest(query, { postId, folderId }, token);

  const res = data?.savePost;

  if (!res?.success) {
    throw new Error(res?.error?.message || "Save failed");
  }

  return res;
}

/* UNSAVE */
export async function unsavePost(postId: string) {
  const token = getToken();

  const query = `
    mutation UnsavePost($postId: String!) {
      unsavePost(postId: $postId) {
        success
        stats { savesCount }
      }
    }
  `;

  const data = await graphqlRequest(query, { postId }, token);

  const res = data?.unsavePost;

  if (!res?.success) {
    throw new Error("Unsave failed");
  }

  return res;
}