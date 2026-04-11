import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likeComment, unlikeComment } from "@/services/graphQL/mutation/actions/comments";

export function useToggleCommentLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      currentLiked,
    }: {
      commentId: string;
      currentLiked: boolean;
    }) => {
      if (currentLiked) {
        return unlikeComment(commentId);
      }
      return likeComment(commentId);
    },

    onMutate: async ({ commentId, currentLiked }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["postComments"],
        exact: false,
      });

      // Snapshot previous value
      const previousComments = queryClient.getQueryData(["postComments"]);

      // Optimistically update
      queryClient.setQueriesData(
        { queryKey: ["postComments"], exact: false },
        (old: any) => {
          if (!old) return old;

          const updateComment = (comment: any) => {
            if (comment.id === commentId) {
              return {
                ...comment,
                viewerState: {
                  ...comment.viewerState,
                  liked: !currentLiked,
                },
                stats: {
                  ...comment.stats,
                  likesCount: currentLiked
                    ? comment.stats.likesCount - 1
                    : comment.stats.likesCount + 1,
                },
              };
            }
            return comment;
          };

          if (old.pages) {
            // Infinite query
            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                comments: page.comments.map(updateComment),
              })),
            };
          } else if (old.comments) {
            // Regular query
            return {
              ...old,
              comments: old.comments.map(updateComment),
            };
          }

          return old;
        }
      );

      return { previousComments };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previousComments) {
        queryClient.setQueryData(["postComments"], ctx.previousComments);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["postComments"],
        exact: false,
      });
    },
  });
}