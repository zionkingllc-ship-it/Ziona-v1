import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCommentReplies,
  likeComment,
  unlikeComment,
} from "@/services/graphQL/mutation/actions/comments";

const TEMP_ID_PREFIX = "temp-";

function isTempId(id: string): boolean {
  return id.startsWith(TEMP_ID_PREFIX);
}

type ReplyLikeVariables = {
  postId: string;
  commentId: string;
  replyId: string;
  isLiked: boolean;
};

function resolveReplyId(queryClient: ReturnType<typeof useQueryClient>, vars: ReplyLikeVariables): string {
  const { postId, commentId, replyId } = vars;
  if (replyId === commentId) throw new Error("A reply like must target a reply, not its parent");
  if (!isTempId(replyId)) return replyId;

  const postData = queryClient.getQueryData(["postComments", postId]) as any;
  const replyData = queryClient.getQueryData(["commentReplies", commentId]) as any;
  const replies = [
    ...(postData?.pages ?? []).flatMap((page: any) =>
      (page.comments ?? []).filter((comment: any) => comment.id === commentId)
        .flatMap((comment: any) => comment.replies ?? [])),
    ...(replyData?.pages ?? []).flatMap((page: any) => page.comments ?? []),
  ];
  const savedReply = replies.find((reply: any) =>
    reply.tempId === replyId && reply.id !== commentId && !isTempId(reply.id));
  if (!savedReply) throw new Error("Wait for the reply to finish posting before liking it");
  return savedReply.id;
}

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
    mutationFn: async (vars: ReplyLikeVariables) => {
      const replyId = resolveReplyId(queryClient, vars);
      return vars.isLiked ? unlikeComment(replyId) : likeComment(replyId);
    },

    onMutate: async (vars: ReplyLikeVariables) => {
      const { postId, commentId, isLiked } = vars;
      const replyId = resolveReplyId(queryClient, vars);
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
        const wasLiked = isLiked;
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
        replyId,
      };
    },

    onSuccess: (response, { postId, commentId }, context) => {
      const replyId = context?.replyId;
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
  });
}