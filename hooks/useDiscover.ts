import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
  fetchDiscoverCategories,
  fetchDiscoverFeed,
  fetchDiscoverSearch,
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

type DiscoverSearchResult = {
  creators: any[];
  posts: any[];
  nextCursor?: string;
  hasMore: boolean;
  creatorCount: number;
  postCount: number;
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

/* =========================
   SEARCH
 ========================= */

export function useDiscoverSearch(
  query: string,
  categorySlug?: string,
  enabled?: boolean,
) {
  const q = useInfiniteQuery<
    DiscoverSearchResult,
    Error,
    InfiniteData<DiscoverSearchResult>,
    [string, string, string | undefined],
    string | undefined
  >({
    queryKey: ["discoverSearch", query, categorySlug],
    queryFn: async ({ pageParam }) => {
      const res = await fetchDiscoverSearch({
        query,
        category: categorySlug,
        cursor: pageParam,
      });

      return {
        creators: res?.creators ?? [],
        posts: res?.posts ?? [],
        nextCursor: res?.nextCursor,
        hasMore: res?.hasMore ?? false,
        creatorCount: res?.creatorCount ?? 0,
        postCount: res?.postCount ?? 0,
      };
    },

    initialPageParam: undefined,

    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,

    enabled: (enabled !== undefined ? enabled : query.trim().length > 0),
  });

  const creators = q.data?.pages?.flatMap((p) => p.creators) ?? [];
  const posts: FeedPost[] =
    q.data?.pages
      ?.flatMap((p) => p.posts)
      .map((p) => normalizePost(p))
      .filter((p): p is FeedPost => !!p)
      .reduce<FeedPost[]>((acc, post) => {
        if (!acc.some((p) => p.id === post.id)) {
          acc.push(post);
        }
        return acc;
      }, []) ?? [];
  const creatorCount =
    q.data?.pages?.[0]?.creatorCount ?? creators.length;
  const postCount =
    q.data?.pages?.[0]?.postCount ?? posts.length;

  return {
    ...q,
    creators,
    posts,
    creatorCount,
    postCount,
  };
}