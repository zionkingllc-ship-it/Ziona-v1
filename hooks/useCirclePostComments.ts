import { useInfiniteQuery } from "@tanstack/react-query";
import { getCirclePostComments } from "@/services/graphQL/mutation/actions/circleComments";

export function useCirclePostComments(postId: string, enabled: boolean = true) {
  return useInfiniteQuery({
    queryKey: ["circlePostComments", postId],
    queryFn: ({ pageParam }) => getCirclePostComments(postId, pageParam, 20),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage ? lastPage.pageInfo.currentPage + 1 : undefined,
    enabled,
    retry: 2,
  });
}
