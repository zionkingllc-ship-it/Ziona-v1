import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likeComment } from "@/services/graphQL/mutation/actions/comments";

export function useToggleCommentLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
    }: {
      commentId: string;
    }) => {
      return likeComment(commentId);
    },

    onMutate: async ({ commentId }) => {
      await queryClient.cancelQueries({
        queryKey: ["postComments"],
        exact: false,
      });

      const previousComments = queryClient.getQueryData(["postComments"]);

      queryClient.setQueriesData(
        { queryKey: ["postComments"], exact: false },
        (old: any) => {
          if (!old) return old;

          const findAndToggle = (item: any) => {
            if (item.id !== commentId) return item;
            const wasLiked = item.viewerState?.liked ?? false;
            return {
              ...item,
              viewerState: {
                ...item.viewerState,
                liked: !wasLiked,
              },
              stats: {
                ...item.stats,
                likesCount: wasLiked
                  ? item.stats.likesCount - 1
                  : item.stats.likesCount + 1,
              },
            };
          };

          const updateComment = (comment: any) => {
            const toggled = findAndToggle(comment);
            if (toggled !== comment) return toggled;
            if (comment.replies) {
              return {
                ...comment,
                replies: comment.replies.map(findAndToggle),
              };
            }
            return comment;
          };

          if (old.pages) {
            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                comments: page.comments.map(updateComment),
              })),
            };
          } else if (old.comments) {
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

    onSuccess: (response, { commentId }) => {
      if (!response) return;
      queryClient.setQueriesData(
        { queryKey: ["postComments"], exact: false },
        (old: any) => {
          if (!old) return old;

          const findAndSync = (item: any) => {
            if (item.id !== commentId) return item;
            return {
              ...item,
              viewerState: {
                ...item.viewerState,
                liked: response.liked,
              },
              stats: {
                ...item.stats,
                likesCount: response.commentStats?.likesCount ?? response.stats.likesCount,
              },
            };
          };

          const syncComment = (comment: any) => {
            const synced = findAndSync(comment);
            if (synced !== comment) return synced;
            if (comment.replies) {
              return {
                ...comment,
                replies: comment.replies.map(findAndSync),
              };
            }
            return comment;
          };

          if (old.pages) {
            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                comments: page.comments.map(syncComment),
              })),
            };
          } else if (old.comments) {
            return {
              ...old,
              comments: old.comments.map(syncComment),
            };
          }
          return old;
        }
      );
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previousComments) {
        queryClient.setQueryData(["postComments"], ctx.previousComments);
      }
    },
  });
}