import { graphqlRequest } from "../../graphqlClient";

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
            liked
            isOwner
          }
          replies {
            id
            text
            createdAt
            user {
              username
            }
            stats {
              likesCount
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
            username
            avatarUrl
          }
          stats {
            likesCount
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
    mutation CreateComment(
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

  const data = await graphqlRequest(query, { postId, text, parentCommentId });

  const res = data?.createComment;
  if (!res?.success) {
    throw new Error(res?.error?.message || "Failed to create comment");
  }

  return res.comment;
}

/* LIKE COMMENT */
export async function likeComment(commentId: string) {
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

  const data = await graphqlRequest(query, { commentId });

  const res = data?.likeComment;
  if (!res?.success) {
    throw new Error(res?.error?.message || "Failed to like comment");
  }

  return res;
}

/* UNLIKE COMMENT */
export async function unlikeComment(commentId: string) {
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

  const data = await graphqlRequest(query, { commentId });

  const res = data?.unlikeComment;
  if (!res?.success) {
    throw new Error(res?.error?.message || "Failed to unlike comment");
  }

  return res;
}
