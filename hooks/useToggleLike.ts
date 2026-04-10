import { useMutation } from "@tanstack/react-query";
import { usePostActionsStore } from "@/store/usePostActionStore";
import { likePost, unlikePost } from "@/services/graphQL/mutation/actions/index";

type ToggleLikeInput = {
  postId: string;
  currentLiked: boolean;
};

export function useToggleLike() {
  const toggleLikeStore = usePostActionsStore((s) => s.toggleLike);

  return useMutation({
    mutationFn: async ({ postId, currentLiked }: ToggleLikeInput) => {
      return currentLiked
        ? unlikePost(postId)
        : likePost(postId);
    },

    onMutate: ({ postId, currentLiked }) => {
      const next = !currentLiked;

      // optimistic update
      toggleLikeStore(postId, next);

      return { postId, previous: currentLiked };
    },

    onError: (_err, _vars, ctx) => {
      if (!ctx) return;

      // rollback
      toggleLikeStore(ctx.postId, ctx.previous);
    },
  });
}