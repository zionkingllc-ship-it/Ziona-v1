import { createComment, deleteComment as deleteCommentService, Comment } from "@/services/graphQL/mutation/actions/comments";
import { useAuthStore } from "@/store/useAuthStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateComment() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: ({
      postId,
      text,
      parentCommentId,
    }: {
      postId: string;
      text: string;
      parentCommentId?: string;
    }) => createComment(postId, text, parentCommentId),

    onMutate: async ({ postId, text, parentCommentId }) => {
      await queryClient.cancelQueries({ queryKey: ["postComments", postId] });

      const previousComments = queryClient.getQueryData(["postComments", postId]);

      if (!user) return { previousComments };

      const tempId = `temp-${Date.now()}`;

      const optimisticComment = {
        id: tempId,
        text,
        createdAt: new Date().toISOString(),
        parentCommentId,
        user: {
          id: user.id,
          username: user.username,
          avatarUrl: user.avatarUrl,
        },
        stats: {
          likesCount: 0,
          repliesCount: 0,
        },
        viewerState: {
          liked: false,
          isOwner: true,
        },
      };

      if (parentCommentId) {
        queryClient.setQueryData(["postComments", postId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              comments: page.comments.map((comment: Comment) =>
                comment.id === parentCommentId
                  ? {
                      ...comment,
                      replies: [optimisticComment, ...(comment.replies || [])],
                      stats: {
                        ...comment.stats,
                        repliesCount: (comment.stats.repliesCount || 0) + 1,
                      },
                    }
                  : comment
              ),
            })),
          };
        });
      } else {
        queryClient.setQueryData(["postComments", postId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any, index: number) =>
              index === 0
                ? { ...page, comments: [optimisticComment, ...page.comments] }
                : page
            ),
          };
        });
      }

      return { previousComments, tempId };
    },

    onSuccess: (response: any, { postId, parentCommentId }, context) => {
      const hasId = !!response?.id;
      const hasTempId = !!context?.tempId;

      if (hasId && hasTempId) {
        const tempId = context.tempId;
        queryClient.setQueryData(["postComments", postId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              comments: page.comments.map((c: any) =>
                c.id === tempId ? { ...c, ...response, id: response.id } : c
              ),
            })),
          };
        });
      } else if (!hasId && hasTempId) {
        console.warn("Response missing id — keeping temp comment in cache");
      } else if (hasId && !hasTempId) {
        queryClient.setQueryData(["postComments", postId], (old: any) => {
          if (!old) return old;
          if (parentCommentId) {
            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                comments: page.comments.map((comment: Comment) =>
                  comment.id === parentCommentId
                    ? {
                        ...comment,
                        replies: [...(comment.replies || []), response],
                        stats: {
                          ...comment.stats,
                          repliesCount: (comment.stats.repliesCount || 0) + 1,
                        },
                      }
                    : comment
                ),
              })),
            };
          }
          return {
            ...old,
            pages: old.pages.map((page: any, index: number) =>
              index === 0
                ? { ...page, comments: [response, ...page.comments] }
                : page
            ),
          };
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["postComments", postId] });
      }
    },
    onError: (err, { postId }, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(["postComments", postId], context.previousComments);
      }
      queryClient.invalidateQueries({ queryKey: ["postComments", postId] });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteCommentService(commentId),
    onSuccess: (_data, commentId) => {
      queryClient.invalidateQueries({ queryKey: ["postComments"] });
    },
  });
}
