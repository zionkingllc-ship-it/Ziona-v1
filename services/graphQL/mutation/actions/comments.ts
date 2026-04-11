import { graphqlRequest } from "../../graphqlClient";
import { getToken } from "./token";

/* GET COMMENTS */
export async function getPostComments(
  postId: string,
  cursor?: string,
  limit: number = 20,
) {
  const token = getToken();

  const query = `
    query GetPostComments($postId: String!, $cursor: String, $limit: Int) {
      postComments(postId: $postId, cursor: $cursor, limit: $limit) {
        hasMore
        nextCursor
        comments {
          id
          text
          createdAt
          author {
            id
            username
            avatarUrl
          }
          stats {
            likesCount
            repliesCount
          }
          viewerState {
            liked
            isOwner
          }
        }
      }
    }
  `;

  const data = await graphqlRequest(query, { postId, cursor, limit }, token);

  const result = data?.postComments;
  if (!result) {
    throw new Error("Failed to fetch comments");
  }

  return result;
}

/* CREATE COMMENT */
export async function createComment(postId: string, text: string) {
  const token = getToken();

  const query = `
    mutation CreateComment($postId: String!, $text: String!) {
      createComment(postId: $postId, text: $text) {
        success
        comment {
          id
          text
          createdAt
          author {
            id
            username
            avatarUrl
          }
          stats {
            likesCount
            repliesCount
          }
          viewerState {
            liked
            isOwner
          }
        }
        error {
          code
          message
        }
      }
    }
  `;

  const data = await graphqlRequest(query, { postId, text }, token);

  const res = data?.createComment;
  if (!res?.success) {
    throw new Error(res?.error?.message || "Failed to create comment");
  }

  return res.comment;
}

/* LIKE COMMENT */
export async function likeComment(commentId: string) {
  const token = getToken();

  const query = `
    mutation LikeComment($commentId: String!) {
      likeComment(commentId: $commentId) {
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

  const data = await graphqlRequest(query, { commentId }, token);

  const res = data?.likeComment;
  if (!res?.success) {
    throw new Error(res?.error?.message || "Failed to like comment");
  }

  return res;
}

/* UNLIKE COMMENT */
export async function unlikeComment(commentId: string) {
  const token = getToken();

  const query = `
    mutation UnlikeComment($commentId: String!) {
      unlikeComment(commentId: $commentId) {
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

  const data = await graphqlRequest(query, { commentId }, token);

  const res = data?.unlikeComment;
  if (!res?.success) {
    throw new Error(res?.error?.message || "Failed to unlike comment");
  }

  return res;
}
