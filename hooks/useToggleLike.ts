import {
  removePostFromLikedQueries,
} from "@/services/graphQL/queries/actions/likeCache";
import { usePostActionsStore } from "@/store/usePostActionStore";
import { likePost, unlikePost } from "@/services/graphQL/mutation/actions/index";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type ToggleLikeInput = {
  postId: string;
  currentLiked: boolean;
};

export function useToggleLike() {
  const queryClient = useQueryClient();
  const toggleLikeStore = usePostActionsStore((s) => s.toggleLike);
  const setLikePending = usePostActionsStore((s) => s.setLikePending);

  return useMutation({
    mutationFn: async ({ postId, currentLiked }: ToggleLikeInput) => {
      return currentLiked
        ? unlikePost(postId)
        : likePost(postId);
    },

    onMutate: ({ postId, currentLiked }) => {
      const next = !currentLiked;

      setLikePending(postId, true);
      toggleLikeStore(postId, next);

      return { postId, previous: currentLiked };
    },

    onSuccess: (_result, variables) => {
      const nextLiked = !variables.currentLiked;

      if (!nextLiked) {
        removePostFromLikedQueries(queryClient, variables.postId);
      }
    },

    onError: (_err, _vars, ctx) => {
      if (!ctx) return;

      toggleLikeStore(ctx.postId, ctx.previous);
    },

    onSettled: (_data, _error, variables) => {
      setLikePending(variables.postId, false);
    },
  });
}
