import { useMutation } from "@tanstack/react-query";
import { usePostActionsStore } from "@/store/usePostActionStore";
import {
  followUser,
  unfollowUser,
} from "@/services/graphQL/mutation/actions/follow";

export function useToggleFollow() {
  const toggleFollowStore = usePostActionsStore((s) => s.toggleFollow);

  return useMutation({
    mutationFn: async ({
      userId,
      currentFollowing,
    }: {
      userId: string;
      currentFollowing: boolean;
    }) => {
      return currentFollowing
        ? unfollowUser(userId)
        : followUser(userId);
    },

    onMutate: ({ userId, currentFollowing }) => {
      toggleFollowStore(userId, !currentFollowing);

      return { userId, previous: currentFollowing };
    },

    onError: (_err, _vars, ctx) => {
      if (!ctx) return;

      toggleFollowStore(ctx.userId, ctx.previous);
    },
  });
}