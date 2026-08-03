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
    setLoading(true);
    fetchDiscoverCategories()
      .then((data) => setCategories(data ?? []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  const refetch = () =>
    fetchDiscoverCategories()
      .then((data) => setCategories(data ?? []))
      .catch(() => {});

  return { categories, loading, refetch };
}

/* =========================
   FEED
========================= */

export function useDiscoverFeed(categoryId?: string, categorySlug?: string) {
  const query = useInfiniteQuery<
    DiscoverResponse,
    Error,
    InfiniteData<DiscoverResponse>,
    [string, string | undefined],
    string | undefined
  >({
    // Key includes the slug so stale cache from older builds (without slug)
    // can never serve data; pull-to-refresh matches by ["discoverFeed"] prefix.
    queryKey: ["discoverFeed", categorySlug ?? categoryId],

    queryFn: async ({ pageParam }) => {
      const isAllCategory =
        categoryId === "all" || categoryId === "1";

      const res = await fetchDiscoverFeed({
        category: isAllCategory ? undefined : categorySlug,
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
          if (categorySlug) {
            if (p.category?.slug !== categorySlug) return false;
          } else if (p.category?.id !== categoryId) {
            return false;
          }
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