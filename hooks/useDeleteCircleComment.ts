import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCircleComment } from "@/services/graphQL/mutation/actions/circleComments";

export function useDeleteCircleComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteCircleComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["circlePostComments"] });
    },
  });
}
