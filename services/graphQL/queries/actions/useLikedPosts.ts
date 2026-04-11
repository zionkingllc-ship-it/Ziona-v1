import { useInfiniteQuery } from "@tanstack/react-query";
import { graphqlRequest } from "@/services/graphQL/graphqlClient";
import { POST_FEED_FIELDS } from "@/services/graphQL/queries/actions/postFields";
import { useAuthStore } from "@/store/useAuthStore";

const GET_LIKED_POSTS = `
  query likedPosts($userId: String!, $limit: Int!, $cursor: String) {
    likedPosts(userId: $userId, limit: $limit, cursor: $cursor) {
      posts {
        ${POST_FEED_FIELDS}
      }

      nextCursor
      hasMore
    }
  }
`;

export function useLikedPosts() {
  const userId = useAuthStore((s) => s.user?.id);

  return useInfiniteQuery({
    queryKey: ["likedPosts", userId],

    enabled: !!userId,

    initialPageParam: undefined,

    queryFn: async ({ pageParam }) => {
      if (!userId) {
        return {
          posts: [],
          nextCursor: undefined,
          hasMore: false,
        };
      }

      console.log("[LIKED] 🚀 Fetch", {
        userId,
        cursor: pageParam,
      });

      const data = await graphqlRequest(GET_LIKED_POSTS, {
        userId,
        limit: 20,
        cursor: pageParam,
      });

      const res = data?.likedPosts ?? {};

      console.log("[LIKED] ✅ Response", {
        count: res.posts?.length,
        hasMore: res.hasMore,
        nextCursor: res.nextCursor,
      });

      return {
        posts: res.posts ?? [],
        nextCursor: res.nextCursor ?? undefined,
        hasMore: res.hasMore ?? false,
      };
    },

    getNextPageParam: (lastPage) => {
      const next = lastPage?.hasMore
        ? lastPage.nextCursor
        : undefined;

      console.log("[LIKED] 🔄 Pagination", {
        hasMore: lastPage?.hasMore,
        nextCursor: lastPage?.nextCursor,
        resolvedNext: next,
      });

      return next;
    },
  });
}
