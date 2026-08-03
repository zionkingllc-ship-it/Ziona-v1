import { graphqlRequest } from "@/services/graphQL/graphqlClient";
import { POST_FEED_FIELDS } from "@/services/graphQL/queries/actions/postFields";

export type SavedPostsResponse = {
  posts: any[];
  nextCursor?: string;
  hasMore: boolean;
};

export async function getSavedPosts(
  folderId?: string,
  mediaType?: string,
  cursor?: string,
  limit: number = 20
): Promise<SavedPostsResponse> {
  const query = `
    query GetUserSavedPost($folderId: String, $mediaType: String, $cursor: String, $limit: Int) {
      savedPosts(folderId: $folderId, mediaType: $mediaType, cursor: $cursor, limit: $limit) {
        posts {
          ${POST_FEED_FIELDS}
        }
        nextCursor
        hasMore
      }
    }
  `;

  const data = await graphqlRequest(query, {
    folderId,
    mediaType,
    cursor,
    limit,
  });

  const res = data?.savedPosts ?? {};

  return {
    posts: res.posts ?? [],
    nextCursor: res.nextCursor ?? undefined,
    hasMore: res.hasMore ?? false,
  };
}
