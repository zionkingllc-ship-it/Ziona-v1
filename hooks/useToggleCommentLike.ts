import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likeComment, unlikeComment } from "@/services/graphQL/mutation/actions/comments";

const TEMP_ID_PREFIX = "temp-";

function isTempId(id: string): boolean {
  return id.startsWith(TEMP_ID_PREFIX);
}

function findRealId(queryClient: ReturnType<typeof useQueryClient>, tempId: string): string | null {
  const queries = queryClient.getQueriesData({ queryKey: ["postComments"], exact: false });
  for (const [, data] of queries as any[]) {
    if (!data) continue;
    const pages = (data as any).pages ?? [{ comments: (data as any).comments }];
    for (const page of pages) {
      for (const c of page.comments ?? []) {
        if (c.tempId === tempId) return c.id;
        if (c.replies) {
          for (const r of c.replies) if (r.tempId === tempId) return r.id;
        }
      }
    }
  }
  return null;
}

function readLikedFromCache(queryClient: ReturnType<typeof useQueryClient>, commentId: string): boolean | undefined {
  const queries = queryClient.getQueriesData({ queryKey: ["postComments"] });
  for (const [, data] of queries as any[]) {
    if (!data) continue;
    const pages = (data as any).pages ?? [{ comments: (data as any).comments }];
    for (const page of pages) {
      for (const c of page.comments ?? []) {
        if (c.id === commentId) return c.viewerState?.liked ?? false;
        if (c.replies) {
          for (const r of c.replies) if (r.id === commentId) return r.viewerState?.liked ?? false;
        }
      }
    }
  }
  return undefined;
}

export function useToggleCommentLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_vars: any) => {
      // NOTE: TanStack Query v5 invokes mutationFn with ONLY the variables.
      // The onMutate return value goes to onSuccess/onError, never here —
      // so the like direction must come from the variables themselves.
      let wasLiked = _vars.isLiked;
      let commentId = _vars.commentId;

      if (isTempId(commentId)) {
        const realId = findRealId(queryClient, commentId);
        if (realId) {
          commentId = realId;
        }
      }

      if (wasLiked === undefined) {
        // Caller didn't supply the pre-toggle state. onMutate already applied
        // the optimistic toggle, so the cache holds the NEW state — invert it.
        const cached = readLikedFromCache(queryClient, commentId);
        wasLiked = cached === undefined ? false : !cached;
      }

      return wasLiked ? unlikeComment(commentId) : likeComment(commentId);
    },

    onMutate: async ({ commentId }) => {
      await queryClient.cancelQueries({
        queryKey: ["postComments"],
        exact: false,
      });

      const previousQueries = queryClient.getQueriesData({ queryKey: ["postComments"] });

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

      queryClient.setQueriesData(
        { queryKey: ["postComments"], exact: false },
        (old: any) => {
          if (!old) return old;

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

      return { previousQueries };
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
                likesCount: response.commentStats?.likesCount ?? response.stats?.likesCount ?? item.stats?.likesCount,
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
      if (ctx?.previousQueries) {
        for (const [key, data] of ctx.previousQueries as any[]) {
          queryClient.setQueryData(key, data);
        }
      }
    },
  });
}