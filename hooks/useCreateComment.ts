import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createComment } from "@/services/graphQL/mutation/actions/comments";

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, text }: { postId: string; text: string }) =>
      createComment(postId, text),

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