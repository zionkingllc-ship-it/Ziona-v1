import { createComment, Comment } from "@/services/graphQL/mutation/actions/comments";
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

      const optimisticComment = {
        id: `temp-${Date.now()}`,
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

      return { previousComments };
    },

    onError: (_err, { postId }, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(["postComments", postId], context.previousComments);
      }
    },

    onSuccess: (_newComment, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["postComments", postId] });
      queryClient.invalidateQueries({ queryKey: ["feed"], exact: false });
    },
  });
}
