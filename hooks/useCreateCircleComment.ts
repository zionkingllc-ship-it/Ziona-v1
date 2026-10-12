import { createCircleComment, CircleComment } from "@/services/graphQL/mutation/actions/circleComments";
import { useAuthStore } from "@/store/useAuthStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateCircleComment() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: ({
      postId,
      text,
    }: {
      postId: string;
      text: string;
      parentCommentId?: string;
    }) => createCircleComment(postId, text),

    onMutate: async ({ postId, text, parentCommentId }) => {
      await queryClient.cancelQueries({ queryKey: ["circlePostComments", postId] });

      const previousData = queryClient.getQueryData(["circlePostComments", postId]);

      if (!user) return { previousData };

      const tempId = `temp-${Date.now()}`;

      const optimisticReply: CircleComment = {
        id: tempId,
        text,
        createdAt: new Date().toISOString(),
        author: {
          id: user.id,
          name: user.username,
          username: user.username,
          avatarUrl: user.avatarUrl,
        },
        likesCount: 0,
        viewerState: { liked: false },
      };

      const optimisticTop: CircleComment = {
        id: tempId,
        text,
        createdAt: new Date().toISOString(),
        author: {
          id: user.id,
          name: user.username,
          username: user.username,
          avatarUrl: user.avatarUrl,
        },
        likesCount: 0,
        replies: [],
        viewerState: { liked: false },
      };

      if (parentCommentId) {
        queryClient.setQueryData(["circlePostComments", postId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              comments: page.comments.map((c: any) =>
                c.id === parentCommentId
                      ? {
                          ...c,
                          replies: [...(c.replies || []), optimisticReply],
                        }
                  : c
              ),
            })),
          };
        });
      } else {
        queryClient.setQueryData(["circlePostComments", postId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any, index: number) =>
              index === 0
                ? {
                    ...page,
                    comments: [optimisticTop, ...(page.comments ?? [])],
                    pageInfo: {
                      ...page.pageInfo,
                      totalCount: page.pageInfo.totalCount + 1,
                    },
                  }
                : page
            ),
          };
        });
      }

      return { previousData, tempId, parentCommentId };
    },

    onSuccess: (response, { postId }, context) => {
      const hasId = !!response?.comment?.id;
      const hasTempId = !!context?.tempId;

      if (hasId && hasTempId) {
        if (context.parentCommentId) {
          queryClient.setQueryData(["circlePostComments", postId], (old: any) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                comments: page.comments.map((c: any) =>
                  c.id === context.parentCommentId
                    ? {
                        ...c,
                        replies: (c.replies || []).map((r: any) =>
                          r.id === context.tempId ? response.comment : r
                        ),
                      }
                    : c
                ),
              })),
            };
          });
        } else {
          queryClient.setQueryData(["circlePostComments", postId], (old: any) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                comments: page.comments.map((c: any) =>
                  c.id === context.tempId ? response.comment : c
                ),
              })),
            };
          });
        }
      } else if (!hasId && hasTempId) {
      } else if (hasId && !hasTempId) {
        if (context.parentCommentId) {
          queryClient.setQueryData(["circlePostComments", postId], (old: any) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                comments: page.comments.map((c: any) =>
                  c.id === context.parentCommentId
                      ? {
                          ...c,
                          replies: [...(c.replies || []), response.comment],
                        }
                    : c
                ),
              })),
            };
          });
        } else {
          queryClient.setQueryData(["circlePostComments", postId], (old: any) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page: any, index: number) =>
                index === 0
                  ? {
                      ...page,
                      comments: [response.comment, ...page.comments],
                      pageInfo: {
                        ...page.pageInfo,
                    totalCount: (page.pageInfo?.totalCount ?? 0) + 1,
                      },
                    }
                  : page
              ),
            };
          });
        }
      }
    },

    onError: (err, { postId }, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["circlePostComments", postId], context.previousData);
      }
      queryClient.invalidateQueries({ queryKey: ["circlePostComments", postId] });
    },
  });
}
