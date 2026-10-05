import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePost as deletePostMutation } from "@/services/graphQL/mutation/deletePost";
import { useAuthStore } from "@/store/useAuthStore";

export function useDeletePost() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: deletePostMutation,
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ["userPosts", userId] });
        queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
      }
    },
    onError: (error) => {
      console.error("[useDeletePost] Mutation error:", error);
    },
  });
}
