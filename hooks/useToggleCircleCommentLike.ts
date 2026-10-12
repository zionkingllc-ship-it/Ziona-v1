import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likeCircleComment } from "@/services/graphQL/mutation/actions/circleComments";

export function useToggleCircleCommentLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
    }: {
      commentId: string;
      currentLiked: boolean;
    }) => {
      return likeCircleComment(commentId);
    },

    onMutate: async ({ commentId, currentLiked }) => {
      await queryClient.cancelQueries({
        queryKey: ["circlePostComments"],
        exact: false,
      });

      const previousData = queryClient.getQueryData(["circlePostComments"]);

      queryClient.setQueriesData(
        { queryKey: ["circlePostComments"], exact: false },
        (old: any) => {
          if (!old) return old;
          const updateComment = (comment: any) => {
            if (comment.id === commentId) {
              return {
                ...comment,
                likesCount: currentLiked
                  ? comment.likesCount - 1
                  : comment.likesCount + 1,
                viewerState: {
                  ...comment.viewerState,
                  liked: !currentLiked,
                },
              };
            }
            if (comment.replies?.length) {
              return {
                ...comment,
                replies: comment.replies.map((r: any) =>
                  r.id === commentId
                    ? {
                        ...r,
                        likesCount: currentLiked
                          ? r.likesCount - 1
                          : r.likesCount + 1,
                        viewerState: {
                          ...r.viewerState,
                          liked: !currentLiked,
                        },
                      }
                    : r
                ),
              };
            }
            return comment;
          };
          if (old.pages) {
            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                comments: (page.comments ?? []).map(updateComment),
              })),
            };
          }
          return old;
        }
      );

      return { previousData };
    },

    onSuccess: (response, { commentId }) => {
      if (response?.likesCount == null) return;
      queryClient.setQueriesData(
        { queryKey: ["circlePostComments"], exact: false },
        (old: any) => {
          if (!old) return old;
          const syncComment = (comment: any) => {
            if (comment.id === commentId) {
              return {
                ...comment,
                likesCount: response.likesCount,
                viewerState: {
                  ...comment.viewerState,
                  liked: response.liked ?? comment.viewerState?.liked,
                },
              };
            }
            if (comment.replies?.length) {
              return {
                ...comment,
                replies: comment.replies.map((r: any) =>
                  r.id === commentId
                    ? {
                        ...r,
                        likesCount: response.likesCount,
                        viewerState: {
                          ...r.viewerState,
                          liked: response.liked ?? r.viewerState?.liked,
                        },
                      }
                    : r
                ),
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
          }
          return old;
        }
      );
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previousData) {
        queryClient.setQueryData(["circlePostComments"], ctx.previousData);
      }
    },
  });
}
