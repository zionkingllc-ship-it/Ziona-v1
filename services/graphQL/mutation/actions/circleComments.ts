import { graphqlRequest } from "../../graphqlClient";

export type CircleCommentAuthor = {
  id: string;
  name?: string | null;
  avatarUrl?: string | null;
};

export type CircleComment = {
  id: string;
  text: string;
  createdAt: string;
  author: CircleCommentAuthor;
  likesCount: number;
  repliesCount?: number;
  replies?: CircleComment[];
  viewerState?: {
    liked: boolean;
  };
};

export type CircleCommentsResponse = {
  comments: CircleComment[];
  pageInfo: {
    currentPage: number;
    hasNextPage: boolean;
    totalCount: number;
  };
};

const COMMENT_FIELDS = `
  id
  text
  createdAt
  author {
    id
    name
    avatarUrl
  }
  likesCount
  repliesCount
  viewerState {
    liked
  }
`;

const REPLY_FIELDS = `
  id
  text
  createdAt
  author {
    id
    name
    avatarUrl
  }
  likesCount
  viewerState {
    liked
  }
`;

/* GET COMMENTS */
export async function getCirclePostComments(
  postId: string,
  page: number = 1,
  pageSize: number = 20,
): Promise<CircleCommentsResponse> {
  const query = `
    query CirclePostComments($postId: String!, $page: Int, $pageSize: Int) {
      circlePostComments(postId: $postId, page: $page, pageSize: $pageSize) {
        comments {
          ${COMMENT_FIELDS}
          replies {
            ${REPLY_FIELDS}
          }
        }
        pageInfo {
          currentPage
          hasNextPage
          totalCount
        }
      }
    }
  `;

  const data = await graphqlRequest(query, { postId, page, pageSize });
  const result = data?.circlePostComments;
  if (!result) {
    throw new Error("Failed to fetch circle post comments");
  }
  return result;
}

/* CREATE COMMENT */
export async function createCircleComment(
  postId: string,
  text: string,
): Promise<{ comment: CircleComment } & { success: boolean }> {
  const mutation = `
    mutation CommentOnCirclePost($postId: String!, $text: String!) {
      commentOnCirclePost(postId: $postId, text: $text) {
        success
        comment {
          ${COMMENT_FIELDS}
          replies {
            ${REPLY_FIELDS}
          }
        }
      }
    }
  `;

  const data = await graphqlRequest(mutation, { postId, text });
  const res = data?.commentOnCirclePost;
  if (!res?.success || !res?.comment) {
    throw new Error("Failed to create comment");
  }
  return { comment: res.comment, success: true };
}

/* GET REPLIES */
export async function getCircleCommentReplies(
  commentId: string,
  page: number = 1,
  pageSize: number = 20,
): Promise<{ replies: CircleComment[]; pageInfo: { currentPage: number; hasNextPage: boolean; totalCount: number } }> {
  const query = `
    query CircleCommentReplies($commentId: String!, $page: Int, $pageSize: Int) {
      circleCommentReplies(commentId: $commentId, page: $page, pageSize: $pageSize) {
        replies {
          ${REPLY_FIELDS}
        }
        pageInfo {
          currentPage
          hasNextPage
          totalCount
        }
      }
    }
  `;

  const data = await graphqlRequest(query, { commentId, page, pageSize });
  const result = data?.circleCommentReplies;
  if (!result) {
    throw new Error("Failed to fetch circle comment replies");
  }
  return result;
}

/* LIKE COMMENT */
export async function likeCircleComment(commentId: string) {
  const mutation = `
    mutation LikeCirclePostComment($commentId: String!) {
      likeCirclePostComment(commentId: $commentId) {
        success
        liked
        likesCount
      }
    }
  `;

  const data = await graphqlRequest(mutation, { commentId });
  const res = data?.likeCirclePostComment;
  if (!res?.success) {
    throw new Error("Failed to like comment");
  }
  return res;
}

/* DELETE COMMENT */
export async function deleteCircleComment(commentId: string) {
  const mutation = `
    mutation DeleteCirclePostComment($commentId: String!) {
      deleteCirclePostComment(commentId: $commentId) {
        success
      }
    }
  `;

  const data = await graphqlRequest(mutation, { commentId });
  const res = data?.deleteCirclePostComment;
  if (!res?.success) {
    throw new Error("Failed to delete comment");
  }
  return res;
}
