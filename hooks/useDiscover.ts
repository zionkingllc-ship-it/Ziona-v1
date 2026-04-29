import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
  fetchDiscoverCategories,
  fetchDiscoverFeed,
} from "@/services/graphQL/queries/discover/discover";

import { FeedPost } from "@/types/feedTypes";
import { normalizePost } from "@/utils/feed/normalizePost";

/* =========================
   TYPES
========================= */

type DiscoverResponse = {
  posts: any[];
  nextCursor?: string;
  hasMore: boolean;
};

/* =========================
   CATEGORIES
========================= */

export function useDiscoverCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiscoverCategories()
      .then((data) => setCategories(data ?? []))
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}

/* =========================
   FEED
========================= */

export function useDiscoverFeed(categoryId?: string) {
  const query = useInfiniteQuery<
    DiscoverResponse,
    Error,
    InfiniteData<DiscoverResponse>,
    [string, string | undefined],
    string | undefined
  >({
    // ✅ FIXED: consistent key
    queryKey: ["discoverFeed", categoryId],

    queryFn: async ({ pageParam }) => {
      const res = await fetchDiscoverFeed({
        cursor: pageParam,
      });

      return {
        posts: res?.posts ?? [],
        nextCursor: res?.nextCursor,
        hasMore: res?.hasMore ?? false,
      };
    },

    initialPageParam: undefined,

    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  });

  /* =========================
     NORMALIZE + FILTER
  ========================== */

  const posts: FeedPost[] =
    query.data?.pages
      ?.flatMap((page) => page.posts)
      .map((p) => normalizePost(p))
      .filter((p): p is FeedPost => !!p)
      .reduce<FeedPost[]>((acc, post) => {
        if (!acc.some((p) => p.id === post.id)) {
          acc.push(post);
        }
        return acc;
      }, [])
      .filter((p): p is FeedPost => {
        const isAllCategory =
          categoryId === "all" || categoryId === "1";

        if (!isAllCategory && categoryId) {
          if (p.category?.id !== categoryId) return false;
        }

        if (p.type === "media") {
          return Array.isArray(p.media) && p.media.length > 0;
        }

        return true;
      }) ?? [];

  return {
    ...query,
    posts,
  };
}