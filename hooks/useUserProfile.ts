import { graphqlRequest } from "@/services/graphQL/graphqlClient";
import { useAuthStore } from "@/store/useAuthStore";
import { UserProfile } from "@/types/userProfile";
import { useQuery } from "@tanstack/react-query";

export const GET_USER_PROFILE = `
query GetUserProfile($userId: String!) {
  userProfile(userId: $userId) {
    id
    username
    fullName
    bio
    avatarUrl
    location
    stats { followersCount followingCount postsCount }
    viewerState { followingAuthor isOwner }
  }
}
`;

function normalizeUserProfile(raw: any): UserProfile | null {
  if (!raw) return null;

  return {
    ...raw,
    stats: raw.stats
      ? {
          followersCount: Number(raw.stats.followersCount || 0),
          followingCount: Number(raw.stats.followingCount || 0),
          postsCount: Number(raw.stats.postsCount || 0),
        }
      : undefined,
  };
}

export function useUserProfile(
  userId?: string,
  options?: { enabled?: boolean },
) {
  const token = useAuthStore((s) => s.tokens?.accessToken); 
  const isBootstrapping = useAuthStore((s) => s.isBootstrapping);
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile", userId],
    enabled: !!userId && !!token && !isBootstrapping,

    refetchOnMount: true,
    refetchOnReconnect: true,

    queryFn: async () => {
      if (!userId) return null;

      const data = await graphqlRequest(GET_USER_PROFILE, { userId });

      console.log("USER PROFILE RAW:", data);
      console.log("userID", userId);

      const normalized = normalizeUserProfile(data?.userProfile);

      console.log("USER PROFILE NORMALIZED:", normalized);

      console.log("USER POSTS RAW FULL RESPONSE:", data);
      console.log("USER POSTS NODE:", data?.userPosts);
      console.log("USER POSTS ARRAY LENGTH:", data?.userPosts?.posts?.length);

      return normalized;
    },
  });
}
