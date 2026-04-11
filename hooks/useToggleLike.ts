import {
  invalidateLikeQueries,
  patchLikeAcrossQueries,
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
      patchLikeAcrossQueries(queryClient, {
        postId,
        liked: next,
      });

      return { postId, previous: currentLiked };
    },

    onSuccess: (result, variables) => {
      const nextLiked = !variables.currentLiked;

      patchLikeAcrossQueries(queryClient, {
        postId: variables.postId,
        liked: nextLiked,
        likesCount: Number(result?.stats?.likesCount ?? 0),
      });

      if (!nextLiked) {
        removePostFromLikedQueries(queryClient, variables.postId);
      }
    },

    onError: (_err, _vars, ctx) => {
      if (!ctx) return;

      toggleLikeStore(ctx.postId, ctx.previous);
      patchLikeAcrossQueries(queryClient, {
        postId: ctx.postId,
        liked: ctx.previous,
      });
    },

    onSettled: async (_data, _error, variables) => {
      setLikePending(variables.postId, false);
      await invalidateLikeQueries(queryClient);
    },
  });
}
