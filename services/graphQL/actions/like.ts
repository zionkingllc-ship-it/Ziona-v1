import { graphqlRequest } from "../graphqlClient";
import { getToken } from "./token";

/* LIKE */
export async function likePost(postId: string) {
  const token = getToken();

  const query = `
    mutation LikePost($postId: String!) {
      likePost(postId: $postId) {
        success
        stats { likesCount }
        error { code message }
      }
    }
  `;

  const data = await graphqlRequest(query, { postId }, token);

  const res = data?.likePost;

  if (!res?.success) {
    throw new Error("Like failed");
  }

  return res;
}

/* UNLIKE */
export async function unlikePost(postId: string) {
  const token = getToken();

  const query = `
    mutation UnlikePost($postId: String!) {
      unlikePost(postId: $postId) {
        success
        stats { likesCount }
        error { code message }
      }
    }
  `;

  const data = await graphqlRequest(query, { postId }, token);

  const res = data?.unlikePost;

  if (!res?.success) {
    throw new Error("Unlike failed");
  }

  return res;
}