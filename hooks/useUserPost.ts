import { graphqlRequest } from "@/services/graphQL/graphqlClient";
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
   QUERY
========================= */

export const GET_USER_POSTS = `
query GetUserPosts($userId: String!, $cursor: String, $limit: Int = 20) {
  userPosts(userId: $userId, cursor: $cursor, limit: $limit) {
    hasMore
    nextCursor
    posts {
      id
      type
      caption
      createdAt
      author { id username avatarUrl }
      category { id label slug bgColor bdColor textPostBg }
      image { items { id url thumbnailUrl width height } }
      video { url thumbnailUrl duration width height }
      scripture { 
        reference text translation book chapter verseStart verseEnd 
      }
    }
  }
}
`;

/* =========================
   HOOK
========================= */

export function useUserPosts(overrideUserId?: string) {
  const authUser = useAuthStore((state) => state.user);
  const user = useAuthStore((s) => s.user?.data ?? s.user); 
  const isBootstrapping = useAuthStore((s) => s.isBootstrapping);

  const userId = overrideUserId ?? authUser?.id;
  console.log("USER ID USED:", userId);
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
      console.log("FETCHING USER POSTS...");
      const data = await graphqlRequest(GET_USER_POSTS, {
        userId,
        cursor: pageParam,
        limit: 20,
      });

      console.log("USER POSTS RAW FULL:", data);
      console.log("USER POSTS ARRAY:", data?.userPosts?.posts);

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

  console.log("RAW POSTS BEFORE NORMALIZE:", rawPosts);

  const normalized = rawPosts.map((p) => normalizePost(p));

  console.log("NORMALIZED BEFORE FILTER:", normalized);
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

  console.log("NORMALIZED USER POSTS:", posts);

  return {
    ...query,
    posts,
    userId,
  };
}
