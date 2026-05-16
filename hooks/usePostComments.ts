import { useInfiniteQuery } from "@tanstack/react-query";
import { getPostComments } from "@/services/graphQL/mutation/actions/comments";

export function usePostComments(postId: string, enabled: boolean = true) {
  return useInfiniteQuery({
    queryKey: ["postComments", postId],
    queryFn: async ({ pageParam }) => {
      try {
        return await getPostComments(postId, pageParam, 20);
      } catch (err) {
        console.error("❌ [usePostComments] Failed for postId:", postId, err);
        throw err;
      }
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled,
    retry: 2,
  });
}