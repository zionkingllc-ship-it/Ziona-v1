import { graphqlRequest } from "@/services/graphQL/graphqlClient";
import { GET_USER_POSTS } from "@/services/graphQL/queries/actions/userPosts";
import { useAuthStore } from "@/store/useAuthStore";
import { FeedPost } from "@/types/feedTypes";
import { normalizePost } from "@/utils/feed/normalizePost";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";

/* =========================
   TYPES
========================= */

type UserPostsResponse = {
  posts: any[];
  nextCursor?: string;
  hasMore: boolean;
};

/* =========================
   HOOK
========================= */

export function useUserPosts(overrideUserId?: string) {
  const authUser = useAuthStore((state) => state.user);
  const isBootstrapping = useAuthStore((s) => s.isBootstrapping);

  const userId = overrideUserId ?? authUser?.id;
  const query = useInfiniteQuery<
    UserPostsResponse,
    Error,
    InfiniteData<UserPostsResponse>,
    [string, string | undefined],
    string | undefined
  >({
    queryKey: ["userPosts", userId],
    enabled: !!userId && !isBootstrapping,

    queryFn: async ({ pageParam }) => {
      if (!userId) {
        return {
          posts: [],
          nextCursor: undefined,
          hasMore: false,
        };
      }
      const data = await graphqlRequest(GET_USER_POSTS, {
        userId,
        cursor: pageParam,
        limit: 20,
      });

      const res = data?.userPosts;

      return {
        posts: res?.posts ?? [],
        nextCursor: res?.nextCursor,
        hasMore: res?.hasMore ?? false,
      };
    },

    initialPageParam: undefined,

    getNextPageParam: (lastPage) =>
      lastPage?.hasMore ? lastPage.nextCursor : undefined,
  });

  const rawPosts = query.data?.pages?.flatMap((page) => page.posts ?? []) ?? [];

  const normalized = rawPosts.map((p) => normalizePost(p));

  /* =========================
     NORMALIZE + SAFETY
  ========================== */

  const posts: FeedPost[] =
    query.data?.pages
      ?.flatMap((page) => page.posts ?? [])
      .map((p) => normalizePost(p))
      .filter((p): p is FeedPost => {
        if (!p) return false;

        if (p.type === "media") {
          return Array.isArray(p.media) && p.media.length > 0;
        }

        return true;
      }) ?? [];

  return {
    ...query,
    posts,
    userId,
  };
}
