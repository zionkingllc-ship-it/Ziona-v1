import { graphqlRequest } from "@/services/graphQL/graphqlClient";
import { AppError } from "@/utils/error";

export async function followUser(userId: string) {
  const query = `
    mutation FollowUser($userId: String!) {
      followUser(userId: $userId) {
        success
        following
        stats {
          followersCount
          followingCount
        }
        error {
          code
          message
        }
      }
    }
  `;

  const data = await graphqlRequest(query, { userId });
  const res = data?.followUser;

  if (!res?.success) {
    throw new AppError(res?.error?.message || "Follow failed", { code: res?.error?.code });
  }

  return {
    ...res,
    following: res.following,
    stats: {
      followersCount: Number(res?.stats?.followersCount ?? 0),
      followingCount: Number(res?.stats?.followingCount ?? 0),
    },
  };
}

export async function unfollowUser(userId: string) {
  const query = `
    mutation UnfollowUser($userId: String!) {
      unfollowUser(userId: $userId) {
        success
        following
        stats {
          followersCount
          followingCount
        }
        error {
          code
          message
        }
      }
    }
  `;

  const data = await graphqlRequest(query, { userId });
  const res = data?.unfollowUser;

  if (!res?.success) {
    throw new AppError(res?.error?.message || "Unfollow failed", { code: res?.error?.code });
  }

  return {
    ...res,
    following: res.following,
    stats: {
      followersCount: Number(res?.stats?.followersCount ?? 0),
      followingCount: Number(res?.stats?.followingCount ?? 0),
    },
  };
}
