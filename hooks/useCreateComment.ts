import { createComment, deleteComment as deleteCommentService, Comment } from "@/services/graphQL/mutation/actions/comments";
import { patchCommentCountAcrossQueries } from "@/services/graphQL/queries/actions/commentCache";
import { useAuthStore } from "@/store/useAuthStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateComment() {
  const queryClient = useQueryClient();

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

      const user = useAuthStore.getState().user;
      if (!user) {
        console.log("[useCreateComment] no user in store, skipping optimistic");
        return { previousComments };
      }

      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      patchCommentCountAcrossQueries(queryClient, { postId, delta: 1 });

      const optimisticComment = {
        id: tempId,
        postId,
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
          if (!old || !Array.isArray(old.pages) || old.pages.length === 0) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              comments: (page.comments ?? []).map((comment: Comment) =>
                comment.id === parentCommentId
                  ? {
                      ...comment,
                      replies: [optimisticComment, ...(comment.replies || [])],
                      stats: {
                        ...(comment.stats ?? {}),
                        repliesCount: (comment.stats?.repliesCount || 0) + 1,
                      },
                    }
                  : comment
              ),
            })),
          };
        });
      } else {
        queryClient.setQueryData(["postComments", postId], (old: any) => {
          if (!old || !Array.isArray(old.pages) || old.pages.length === 0) {
            return {
              pages: [
                {
                  comments: [optimisticComment],
                  totalCount: 1,
                  hasMore: false,
                  nextCursor: undefined,
                },
              ],
              pageParams: [undefined],
            };
          }
          return {
            ...old,
            pages: old.pages.map((page: any, index: number) =>
              index === 0
                ? { ...page, comments: [optimisticComment, ...(page.comments ?? [])] }
                : page
            ),
          };
        });
      }

      return { previousComments, tempId, parentCommentId };
    },

    onSuccess: (response: any, { postId, parentCommentId }, context) => {
      const hasId = !!response?.id;
      const hasTempId = !!context?.tempId;
      const effectiveParentId = parentCommentId ?? context?.parentCommentId;

      if (hasId && hasTempId) {
        const tempId = context.tempId;
        if (effectiveParentId) {
          queryClient.setQueryData(["postComments", postId], (old: any) => {
            if (!old || !Array.isArray(old.pages)) return old;
            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                comments: (page.comments ?? []).map((c: any) =>
                  c.id === effectiveParentId
                    ? {
                        ...c,
                        replies: (c.replies || []).map((r: any) =>
                          r.id === tempId ? { ...r, ...response, id: response.id } : r
                        ),
                      }
                    : c
                ),
              })),
            };
          });
        } else {
          queryClient.setQueryData(["postComments", postId], (old: any) => {
            if (!old || !Array.isArray(old.pages)) return old;
            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                comments: (page.comments ?? []).map((c: any) =>
                  c.id === tempId ? { ...c, ...response, id: response.id } : c
                ),
              })),
            };
          });
        }
      } else if (!hasId && hasTempId) {
        // keep optimistic, will be replaced on invalidate if needed
      } else if (hasId && !hasTempId) {
        queryClient.setQueryData(["postComments", postId], (old: any) => {
          if (!old || !Array.isArray(old.pages) || old.pages.length === 0) {
            if (effectiveParentId) {
              return old;
            }
            return {
              pages: [
                {
                  comments: [response],
                  totalCount: 1,
                  hasMore: false,
                  nextCursor: undefined,
                },
              ],
              pageParams: [undefined],
            };
          }
          if (effectiveParentId) {
            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                comments: (page.comments ?? []).map((comment: Comment) =>
                  comment.id === effectiveParentId
                    ? {
                        ...comment,
                        replies: [...(comment.replies || []), { ...response, tempId: context?.tempId }],
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
                ? { ...page, comments: [response, ...(page.comments ?? [])] }
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
      patchCommentCountAcrossQueries(queryClient, { postId, delta: -1 });
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
