import { graphqlRequest } from "../../graphqlClient";
import { AppError } from "@/utils/error";

export type CommentUser = {
  id?: string;
  username: string;
  avatarUrl?: string | null;
};

export type CommentReply = {
  id: string;
  text: string;
  createdAt: string;
  user: CommentUser;
  stats: {
    likesCount: number;
  };
  viewerState?: {
    liked: boolean;
    isOwner: boolean;
  };
};

export type Comment = {
  id: string;
  text: string;
  createdAt: string;
  user: CommentUser;
  stats: {
    likesCount: number;
    repliesCount: number;
  };
  viewerState?: {
    liked: boolean;
    isOwner: boolean;
  };
  replies?: CommentReply[];
  parentCommentId?: string;
};

export type PostCommentsResponse = {
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
  comments: Comment[];
};

/* GET COMMENTS */
export async function getPostComments(
  postId: string,
  cursor?: string,
  limit: number = 20,
): Promise<PostCommentsResponse> {
  const query = `
    query GetComments($postId: String!, $cursor: String, $limit: Int) {
      postComments(postId: $postId, cursor: $cursor, limit: $limit) {
        totalCount
        hasMore
        nextCursor
        comments {
          id
          text
          createdAt
          user {
            id
            username
            avatarUrl
          }
          stats {
            likesCount
            repliesCount
          }
          viewerState {
            isOwner
            liked
          }
          replies {
            id
            text
            createdAt
            user {
              id
              username
              avatarUrl
            }
            stats {
              likesCount
              repliesCount
            }
            viewerState {
              isOwner
              liked
            }
          }
        }
      }
    }
  `;

  const data = await graphqlRequest(query, { postId, cursor, limit });

  const result = data?.postComments;
  if (!result) {
    throw new Error("Failed to fetch comments");
  }

  return result;
}

/* GET REPLIES */
export async function getCommentReplies(
  commentId: string,
  cursor?: string,
  limit: number = 20,
) {
  const query = `
    query GetReplies($commentId: String!, $cursor: String) {
      commentReplies(commentId: $commentId, cursor: $cursor, limit: $limit) {
        hasMore
        nextCursor
        comments {
          id
          text
          createdAt
          user {
            id
            username
            avatarUrl
          }
          stats {
            likesCount
          }
          viewerState {
            isOwner
            liked
          }
        }
      }
    }
  `;

  const data = await graphqlRequest(query, { commentId, cursor, limit });

  return data?.commentReplies ?? { hasMore: false, comments: [] };
}

/* CREATE COMMENT */
export async function createComment(
  postId: string,
  text: string,
  parentCommentId?: string,
) {
  const query = `
    mutation AddComment(
      $postId: String!
      $text: String!
      $parentCommentId: String
    ) {
      createComment(
        postId: $postId
        text: $text
        parentCommentId: $parentCommentId
      ) {
        success
        errorCode
        message
        comment {
          id
          text
          parentCommentId
          createdAt
          user {
            id
            username
            avatarUrl
          }
          stats {
            likesCount
            repliesCount
          }
          viewerState {
            isOwner
            liked
          }
          replies {
            user {
              username
              id
              avatarUrl
            }
            stats {
              likesCount
              repliesCount
            }
          }
        }
        error {
          code
          message
          details
        }
      }
    }
  `;

  const data = await graphqlRequest(query, { postId, text, parentCommentId });

  const res = data?.createComment;
  if (!res?.success) {
    throw new AppError(res?.error?.message || "Failed to create comment", { code: res?.error?.code });
  }

  return {
    ...res.comment,
    message: res.message,
  };
}

/* DELETE COMMENT */
export async function deleteComment(commentId: string) {
  const mutation = `
    mutation DeleteComment($commentId: String!) {
      deleteComment(commentId: $commentId) {
        success
        error {
          code
          message
        }
      }
    }
  `;

  const data = await graphqlRequest(mutation, { commentId });
  const res = data?.deleteComment;
  if (!res?.success) {
    throw new AppError(res?.error?.message || "Failed to delete comment", { code: res?.error?.code });
  }
  return res;
}

/* LIKE COMMENT */
export async function likeComment(commentId: string) {
  const query = `
    mutation LikeComment($commentId: String!) {
      likeComment(commentId: $commentId) {
        success
        liked
        stats {
          likesCount
        }
        commentStats {
          likesCount
        }
        error {
          code
          message
        }
      }
    }
  `;

  const data = await graphqlRequest(query, { commentId });

  const res = data?.likeComment;
  if (!res?.success) {
    throw new AppError(res?.error?.message || "Failed to like comment", { code: res?.error?.code });
  }

  return res;
}

/* UNLIKE COMMENT */
export async function unlikeComment(commentId: string) {
  const query = `
    mutation UnlikeComment($commentId: String!) {
      unlikeComment(commentId: $commentId) {
        success
        liked
        stats {
          likesCount
        }
        commentStats {
          likesCount
        }
        error {
          code
          message
        }
      }
    }
  `;

  const data = await graphqlRequest(query, { commentId });

  const res = data?.unlikeComment;
  if (!res?.success) {
    throw new AppError(res?.error?.message || "Failed to unlike comment", { code: res?.error?.code });
  }

  return res;
}


