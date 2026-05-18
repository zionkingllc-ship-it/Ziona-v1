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

    onSuccess: (response: any, { postId }, context) => {
      console.log("📝 [useCreateComment] onSuccess:", {
        hasId: !!response?.id,
        responseId: response?.id,
        hasTempId: !!context?.tempId,
        tempId: context?.tempId,
        responseKeys: Object.keys(response || {}),
      });

      if (!response?.id) {
        console.warn("📝 [useCreateComment] onSuccess missing id, invalidating");
        queryClient.invalidateQueries({ queryKey: ["postComments", postId] });
        return;
      }
      if (!context?.tempId) {
        console.warn("📝 [useCreateComment] onSuccess missing tempId, invalidating");
        queryClient.invalidateQueries({ queryKey: ["postComments", postId] });
        return;
      }

      queryClient.setQueryData(["postComments", postId], (old: any) => {
        if (!old) {
          console.warn("📝 [useCreateComment] setQueryData: old cache is empty");
          return old;
        }
        const newData = {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            comments: page.comments.map((c: any) => {
              if (c.id === context.tempId) {
                console.log("📝 [useCreateComment] Replacing tempId:", context.tempId, "with realId:", response.id);
                return { ...c, ...response, id: response.id };
              }
              return c;
            }),
          })),
        };
        console.log("📝 [useCreateComment] Cache after replacement:", {
          pages: newData.pages.length,
          commentsPerPage: newData.pages.map((p: any) => p.comments.length),
          commentIds: newData.pages.flatMap((p: any) => p.comments.map((c: any) => c.id)),
        });
        return newData;
      });
    },
    onError: (err, { postId }, context) => {
      console.log("📝 [useCreateComment] onError:", err);
      if (context?.previousComments) {
        queryClient.setQueryData(["postComments", postId], context.previousComments);
      }
      queryClient.invalidateQueries({ queryKey: ["postComments", postId] });
    },
    onSettled: (_data, _err, { postId }) => {
      console.log("📝 [useCreateComment] onSettled — mutation finished", { hasData: !!_data, hasErr: !!_err });
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
