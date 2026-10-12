import { POST_FEED_FIELDS } from "@/services/graphQL/queries/actions/postFields";

export const GET_USER_POSTS = `
query GetUserPosts($userId: String!, $cursor: String, $limit: Int = 20) {
  userPosts(userId: $userId, cursor: $cursor, limit: $limit) {
    hasMore
    nextCursor
    posts {
      ${POST_FEED_FIELDS}
    }
  }
}
`;
