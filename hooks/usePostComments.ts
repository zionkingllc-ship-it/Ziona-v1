import { useInfiniteQuery } from "@tanstack/react-query";
import { getPostComments } from "@/services/graphQL/mutation/actions/comments";

export function usePostComments(postId: string, enabled: boolean = true) {
  return useInfiniteQuery({
    queryKey: ["postComments", postId],
    queryFn: ({ pageParam }) =>
      getPostComments(postId, pageParam, 20),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled,
  });
}