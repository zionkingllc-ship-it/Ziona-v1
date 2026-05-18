import { useInfiniteQuery } from "@tanstack/react-query";
import { getPostComments } from "@/services/graphQL/mutation/actions/comments";

export function usePostComments(postId: string, enabled: boolean = true) {
  return useInfiniteQuery({
    queryKey: ["postComments", postId],
    queryFn: async ({ pageParam }) => {
      try {
        const result = await getPostComments(postId, pageParam, 20);
        console.log("📝 [usePostComments] fetched:", {
          postId,
          cursor: pageParam,
          hasMore: result.hasMore,
          nextCursor: result.nextCursor,
          count: result.comments?.length,
          commentIds: result.comments?.map((c: any) => c.id),
        });
        return result;
      } catch (err) {
        console.error("📝 [usePostComments] FAILED for postId:", postId, err);
        throw err;
      }
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      const next = lastPage.hasMore ? lastPage.nextCursor : undefined;
      console.log("📝 [usePostComments] pagination:", { hasMore: lastPage.hasMore, nextCursor: lastPage.nextCursor, resolvedNext: next });
      return next;
    },
    enabled,
    retry: 2,
  });
}