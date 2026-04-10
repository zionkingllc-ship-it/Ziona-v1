import { graphqlRequest } from "@/services/graphQL/graphqlClient";

/* =========================
   LIKE POST
========================= */
export async function likePost(postId: string) {
  const query = `
    mutation LikePost($postId: String!) {
      likePost(postId: $postId) {
        success
        stats {
          likesCount
        }
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
    stats: {
      likesCount: Number(res?.stats?.likesCount ?? 0),
    },
  };
}

/* =========================
   UNLIKE POST
========================= */
export async function unlikePost(postId: string) {
  const query = `
    mutation UnlikePost($postId: String!) {
      unlikePost(postId: $postId) {
        success
        stats {
          likesCount
        }
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
    stats: {
      likesCount: Number(res?.stats?.likesCount ?? 0),
    },
  };
}