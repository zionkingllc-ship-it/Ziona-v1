import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCommentReplies,
  likeComment,
  CommentReply,
} from "@/services/graphQL/mutation/actions/comments";

export function useCommentReplies(commentId: string) {
  return useInfiniteQuery({
    queryKey: ["commentReplies", commentId],
    queryFn: ({ pageParam }) => getCommentReplies(commentId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!commentId,
  });
}

export function useReplyLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      replyId,
    }: {
      commentId: string;
      replyId: string;
    }) => {
      return likeComment(replyId);
    },
    onMutate: async ({ commentId, replyId }) => {
      await queryClient.cancelQueries({
        queryKey: ["commentReplies", commentId],
      });

      const previousReplies = queryClient.getQueryData([
        "commentReplies",
        commentId,
      ]);

      queryClient.setQueryData(
        ["commentReplies", commentId],
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              comments: page.comments.map((reply: CommentReply) =>
                reply.id === replyId
                  ? {
                      ...reply,
                      viewerState: {
                        ...reply.viewerState,
                        liked: !reply.viewerState?.liked,
                      },
                      stats: {
                        ...reply.stats,
                        likesCount: reply.viewerState?.liked
                          ? reply.stats.likesCount - 1
                          : reply.stats.likesCount + 1,
                      },
                    }
                  : reply
              ),
            })),
          };
        }
      );

      return { previousReplies };
    },
    onError: (_err, { commentId }, context) => {
      if (context?.previousReplies) {
        queryClient.setQueryData(
          ["commentReplies", commentId],
          context.previousReplies
        );
      }
    },
    onSettled: (_data, _err, { commentId }) => {
      queryClient.invalidateQueries({ queryKey: ["commentReplies", commentId] });
    },
  });
}
