import { useInfiniteQuery } from "@tanstack/react-query";
import {
  fetchForYouFeed,
  fetchFollowingFeed,
} from "@/services/feed/feedServices";

/* =========================
   TYPES
========================= */

type FeedResponse = {
  posts: any[];
  nextCursor?: string;
  hasMore: boolean;
};

/* =========================
   FOR YOU
========================= */

export function useForYouFeed() {
  return useInfiniteQuery<
    FeedResponse,
    Error,
    FeedResponse,
    [string],
    string | undefined
  >({
    queryKey: ["forYouFeed"],

    queryFn: ({ pageParam }) =>
      fetchForYouFeed({ pageParam }),

    initialPageParam: undefined,

    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,

    staleTime: 5 * 60 * 1000,
  });
}

/* =========================
   FOLLOWING
========================= */

export function useFollowingFeed() {
  return useInfiniteQuery<
    FeedResponse,
    Error,
    FeedResponse,
    [string],
    string | undefined
  >({
    queryKey: ["followingFeed"],

    queryFn: ({ pageParam }) =>
      fetchFollowingFeed({ pageParam }),

    initialPageParam: undefined,

    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,

    staleTime: 5 * 60 * 1000,
  });
}