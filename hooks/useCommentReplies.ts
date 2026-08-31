import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCommentReplies,
  likeComment,
  unlikeComment,
} from "@/services/graphQL/mutation/actions/comments";

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
      postId,
      commentId,
      replyId,
      isLiked,
    }: {
      postId: string;
      commentId: string;
      replyId: string;
      isLiked?: boolean;
    }) => {
      // Use explicit isLiked (pre-optimistic) when provided
      let wasLiked = isLiked;
      if (wasLiked === undefined) {
        const postData = queryClient.getQueryData(["postComments", postId]) as any;
        if (postData?.pages) {
          for (const page of postData.pages) {
            for (const c of page.comments ?? []) {
              if (c.id === commentId) {
                const r = (c.replies ?? []).find((x: any) => x.id === replyId);
                if (r) wasLiked = r.viewerState?.liked ?? false;
              }
            }
          }
        }
        if (wasLiked === undefined) {
          const replyData = queryClient.getQueryData(["commentReplies", commentId]) as any;
          if (replyData?.pages) {
            for (const page of replyData.pages) {
              const r = (page.comments ?? []).find((x: any) => x.id === replyId);
              if (r) wasLiked = r.viewerState?.liked ?? false;
            }
          }
        }
      }
      return wasLiked ? unlikeComment(replyId) : likeComment(replyId);
    },
    onMutate: async ({ postId, commentId, replyId }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["postComments", postId] }),
        queryClient.cancelQueries({ queryKey: ["commentReplies", commentId] }),
      ]);

      const previousPostComments = queryClient.getQueryData([
        "postComments",
        postId,
      ]);
      const previousReplies = queryClient.getQueryData([
        "commentReplies",
        commentId,
      ]);

      const toggleReply = (reply: any) => {
        if (reply.id !== replyId) return reply;
        const wasLiked = reply.viewerState?.liked ?? false;
        return {
          ...reply,
          viewerState: {
            ...(reply.viewerState ?? {}),
            liked: !wasLiked,
          },
          stats: {
            ...(reply.stats ?? {}),
            likesCount: wasLiked
              ? Math.max(0, (reply.stats?.likesCount ?? 0) - 1)
              : (reply.stats?.likesCount ?? 0) + 1,
          },
        };
      };

      let foundInPostComments = false;

      queryClient.setQueryData(
        ["postComments", postId],
        (old: any) => {
          if (!old || !Array.isArray(old.pages)) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              comments: (page.comments ?? []).map((comment: any) => {
                if (comment.id !== commentId) return comment;
                foundInPostComments = true;
                return {
                  ...comment,
                  replies: (comment.replies ?? []).map(toggleReply),
                };
              }),
            })),
          };
        },
      );

      queryClient.setQueryData(
        ["commentReplies", commentId],
        (old: any) => {
          if (!old || !Array.isArray(old.pages)) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              comments: (page.comments ?? []).map(toggleReply),
            })),
          };
        },
      );

      return {
        previousPostComments,
        previousReplies,
        foundInPostComments,
      };
    },
    onSuccess: (response, { postId, commentId, replyId }) => {
      if (!response) return;

      const syncReply = (reply: any) => {
        if (reply.id !== replyId) return reply;
        return {
          ...reply,
          viewerState: {
            ...(reply.viewerState ?? {}),
            liked: response.liked,
          },
          stats: {
            ...(reply.stats ?? {}),
            likesCount:
              response.commentStats?.likesCount ??
              response.stats?.likesCount ??
              reply.stats?.likesCount,
          },
        };
      };

      queryClient.setQueryData(
        ["postComments", postId],
        (old: any) => {
          if (!old || !Array.isArray(old.pages)) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              comments: (page.comments ?? []).map((comment: any) =>
                comment.id === commentId
                  ? {
                      ...comment,
                      replies: (comment.replies ?? []).map(syncReply),
                    }
                  : comment,
              ),
            })),
          };
        },
      );

      queryClient.setQueryData(
        ["commentReplies", commentId],
        (old: any) => {
          if (!old || !Array.isArray(old.pages)) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              comments: (page.comments ?? []).map(syncReply),
            })),
          };
        },
      );
    },
    onError: (_err, { postId, commentId }, context) => {
      if (context?.previousPostComments) {
        queryClient.setQueryData(
          ["postComments", postId],
          context.previousPostComments,
        );
      }
      if (context?.previousReplies) {
        queryClient.setQueryData(
          ["commentReplies", commentId],
          context.previousReplies,
        );
      }
    },
    onSettled: (_data, _err, { commentId }) => {
      queryClient.invalidateQueries({ queryKey: ["commentReplies", commentId] });
    },
  });
}
