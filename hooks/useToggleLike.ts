import { useMutation } from "@tanstack/react-query";
import { usePostActionsStore } from "@/store/usePostActionStore";
import { likePost, unlikePost } from "@/services/graphQL/actions/index";

export function useToggleLike() {
  const toggleLikeStore = usePostActionsStore((s) => s.toggleLike);

  return useMutation({
    mutationFn: async ({
      postId,
    }: {
      postId: string;
    }) => {
      const state = usePostActionsStore.getState();
      const currentLiked = state.likedPosts[postId];

      if (currentLiked === undefined) {
        // fallback → treat as not liked
        return likePost(postId);
      }

      return currentLiked
        ? unlikePost(postId)
        : likePost(postId);
    },

    onMutate: ({ postId }) => {
      const state = usePostActionsStore.getState();

      const currentLiked = state.likedPosts[postId] ?? false;

      const next = !currentLiked;

      // optimistic
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