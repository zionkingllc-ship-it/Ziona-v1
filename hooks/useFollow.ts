import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FollowersResponse,
  FollowingResponse,
  FriendsListResponse,
  SuggestedCreatorsResponse,
  getFollowers,
  getFollowing,
  getFriendsList,
  getSuggestedCreators,
} from "@/services/graphQL/queries/follow";
import { followUser, unfollowUser } from "@/services/graphQL/mutation/actions/index";
import { usePostActionsStore } from "@/store/usePostActionStore";
import { useAuthStore } from "@/store/useAuthStore";

const FOLLOWERS_QUERY_KEY = "followers";
const FOLLOWING_QUERY_KEY = "following";
const FRIENDS_QUERY_KEY = "friendsList";
const SUGGESTED_QUERY_KEY = "suggestedCreators";

export function useFollowers(userId: string) {
  return useQuery({
    queryKey: [FOLLOWERS_QUERY_KEY, userId],
    queryFn: async () => {
      const result = await getFollowers(userId);
      console.log("FOLLOWERS RESULT:", result);
      return result;
    },
    enabled: !!userId,
  });
}

export function useFollowing(userId: string) {
  return useQuery({
    queryKey: [FOLLOWING_QUERY_KEY, userId],
    queryFn: async () => {
      const result = await getFollowing(userId);
      console.log("FOLLOWING RESULT:", result);
      return result;
    },
    enabled: !!userId,
  });
}

export function useFriendsList(search?: string) {
  return useQuery({
    queryKey: [FRIENDS_QUERY_KEY, search],
    queryFn: () => getFriendsList(search),
  });
}

export function useSuggestedCreators() {
  return useQuery({
    queryKey: [SUGGESTED_QUERY_KEY],
    queryFn: async () => {
      const result = await getSuggestedCreators();
      console.log("SUGGESTED CREATORS RESULT:", result);
      return result;
    },
  });
}

type ToggleFollowInput = {
  userId: string;
  currentFollowing: boolean;
};

export function useToggleFollow() {
  const queryClient = useQueryClient();
  const toggleFollowStore = usePostActionsStore((s) => s.toggleFollow);
  const currentUserId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: async ({ userId, currentFollowing }: ToggleFollowInput) => {
      return currentFollowing ? unfollowUser(userId) : followUser(userId);
    },

    onMutate: ({ userId, currentFollowing }) => {
      toggleFollowStore(userId, !currentFollowing);
      return { userId, previous: currentFollowing };
    },

    onError: (_err, _vars, ctx) => {
      if (!ctx) return;
      toggleFollowStore(ctx.userId, ctx.previous);
    },

    onSettled: async (_data, _error, variables) => {
      await queryClient.invalidateQueries({ queryKey: [FOLLOWERS_QUERY_KEY, variables.userId] });
      await queryClient.invalidateQueries({ queryKey: [FOLLOWING_QUERY_KEY, variables.userId] });
      await queryClient.invalidateQueries({ queryKey: [FOLLOWING_QUERY_KEY, currentUserId] });
      await queryClient.invalidateQueries({ queryKey: [SUGGESTED_QUERY_KEY] });
      await queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}
