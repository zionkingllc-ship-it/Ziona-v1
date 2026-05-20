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

  console.log(`🔍 [savedPosts] Fetching saved posts folderId=${folderId} mediaType=${mediaType} cursor=${cursor} limit=${limit}`);
  const data = await graphqlRequest(query, {
    folderId,
    mediaType,
    cursor,
    limit,
  });
  console.log("🔍 [savedPosts] Raw API response:", JSON.stringify(data, null, 2));

  const res = data?.savedPosts ?? {};
  console.log(`🔍 [savedPosts] Parsed: ${res.posts?.length ?? 0} posts, hasMore=${res.hasMore}, nextCursor=${res.nextCursor}`);

  return {
    posts: res.posts ?? [],
    nextCursor: res.nextCursor ?? undefined,
    hasMore: res.hasMore ?? false,
  };
}
