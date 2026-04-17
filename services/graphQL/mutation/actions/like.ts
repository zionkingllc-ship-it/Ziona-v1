import { graphqlRequest } from "@/services/graphQL/graphqlClient";

/* =========================
   LIKE POST
 ========================= */
export async function likePost(postId: string) {
  const query = `
    mutation Like($postId: String!) {
      likePost(postId: $postId) {
        success
        liked
        stats {
          savesCount
          likesCount
          commentsCount
        }
        message
        error {
          code
          message
        }
      }
    }
  `;

  const data = await graphqlRequest(query, { postId });

  const res = data?.likePost;

  if (!res?.success) {
    throw new Error(res?.error?.message || "Like failed");
  }

  return {
    ...res,
    liked: res.liked,
    message: res.message,
    stats: {
      savesCount: Number(res?.stats?.savesCount ?? 0),
      likesCount: Number(res?.stats?.likesCount ?? 0),
      commentsCount: Number(res?.stats?.commentsCount ?? 0),
    },
  };
}

/* =========================
   UNLIKE POST
 ========================= */
export async function unlikePost(postId: string) {
  const query = `
    mutation Unlike($postId: String!) {
      unlikePost(postId: $postId) {
        success
        liked
        stats {
          savesCount
          likesCount
          commentsCount
        }
        message
        error {
          code
          message
        }
      }
    }
  `;

  const data = await graphqlRequest(query, { postId });

  const res = data?.unlikePost;

  if (!res?.success) {
    throw new Error(res?.error?.message || "Unlike failed");
  }

  return {
    ...res,
    liked: res.liked,
    message: res.message,
    stats: {
      savesCount: Number(res?.stats?.savesCount ?? 0),
      likesCount: Number(res?.stats?.likesCount ?? 0),
      commentsCount: Number(res?.stats?.commentsCount ?? 0),
    },
  };
}