import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCommentReplies,
  likeComment,
  unlikeComment,
  CommentReply,
} from "@/services/graphQL/mutation/actions/comments";
import { useAuthStore } from "@/store/useAuthStore";

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
      isLiked,
    }: {
      commentId: string;
      replyId: string;
      isLiked: boolean;
    }) => {
      const fn = isLiked ? unlikeComment : likeComment;
      return fn(replyId);
    },
    onMutate: async ({ commentId, replyId, isLiked }) => {
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
                      stats: {
                        ...reply.stats,
                        likesCount: isLiked
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
