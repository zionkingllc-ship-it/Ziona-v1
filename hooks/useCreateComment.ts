import { createComment } from "@/services/graphQL/mutation/actions/comments";
import { useAuthStore } from "@/store/useAuthStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateComment() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: ({ postId, text }: { postId: string; text: string }) =>
      createComment(postId, text),

    onMutate: async ({ postId, text }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["postComments", postId] });

      // Snapshot the previous value
      const previousComments = queryClient.getQueryData([
        "postComments",
        postId,
      ]);

      // Optimistically update to the new value
      if (user) {
        const optimisticComment = {
          id: `temp-${Date.now()}`,
          text,
          createdAt: new Date().toISOString(),
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

        queryClient.setQueryData(["postComments", postId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any, index: number) =>
              index === 0
                ? { ...page, comments: [optimisticComment, ...page.comments] }
                : page,
            ),
          };
        });
      }

      // Return a context object with the snapshotted value
      return { previousComments };
    },

    onError: (err, { postId }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousComments) {
        queryClient.setQueryData(
          ["postComments", postId],
          context.previousComments,
        );
      }
    },

    onSuccess: (newComment, { postId }) => {
      // Invalidate and refetch comments
      queryClient.invalidateQueries({
        queryKey: ["postComments", postId],
      });

      // Update comment count in post stats
      queryClient.invalidateQueries({
        queryKey: ["feed"],
        exact: false,
      });
    },
  });
}
