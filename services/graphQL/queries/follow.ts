import { graphqlRequest } from "@/services/graphQL/graphqlClient";

export type FollowUser = {
  id: string;
  username: string;
  avatarUrl?: string | null;
  isFollowing?: boolean;
  isFollowedBy?: boolean;
};

export type FollowersResponse = {
  hasMore: boolean;
  users: FollowUser[];
};

export type FollowingResponse = {
  hasMore: boolean;
  users: FollowUser[];
};

export type FriendsListResponse = {
  id: string;
  username: string;
  avatarUrl?: string | null;
}[];

export type SuggestedCreatorsResponse = {
  id: string;
  username: string;
  avatarUrl?: string | null;
  bio?: string;
  stats?: {
    followersCount: number;
    postsCount: number;
    followingCount: number;
  };
}[];

export type SearchUsersResponse = {
  id: string;
  username: string;
  avatarUrl?: string | null;
}[];

export async function getFollowers(
  userId: string,
  cursor?: string
): Promise<FollowersResponse> {
  const query = `
    query GetFollowers($userId: String!, $cursor: String) {
      followers(userId: $userId, cursor: $cursor, limit: 20) {
        hasMore
        nextCursor
        users {
          id
          username
          avatarUrl
          isFollowing
        }
      }
    }
  `;

  const data = await graphqlRequest(query, { userId, cursor });
  const result = data?.followers;

  if (!result) return { hasMore: false, users: [] };

  return {
    hasMore: result.hasMore ?? false,
    users: (result.users ?? []).map((u: any) => ({
      id: u.id,
      username: u.username,
      avatarUrl: u.avatarUrl,
      isFollowing: u.isFollowing ?? false,
      isFollowedBy: false,
    })),
  };
}

export async function getFollowing(
  userId: string,
  cursor?: string
): Promise<FollowingResponse> {
  const query = `
    query GetFollowing($userId: String!, $cursor: String) {
      following(userId: $userId, cursor: $cursor, limit: 20) {
        hasMore
        nextCursor
        users {
          id
          username
          avatarUrl
          isFollowing
        }
      }
    }
  `;

  const data = await graphqlRequest(query, { userId, cursor });
  const result = data?.following;

  if (!result) return { hasMore: false, users: [] };

  return {
    hasMore: result.hasMore ?? false,
    users: (result.users ?? []).map((u: any) => ({
      id: u.id,
      username: u.username,
      avatarUrl: u.avatarUrl,
      isFollowing: u.isFollowing ?? false,
      isFollowedBy: false,
    })),
  };
}

export async function getFriendsList(
  search?: string
): Promise<FriendsListResponse> {
  const query = `
    query GetFriendsList($search: String) {
      friendsList(search: $search) {
        id
        username
        avatarUrl
      }
    }
  `;

  const data = await graphqlRequest(query, { search });
  return data?.friendsList ?? [];
}

export async function getSuggestedCreators(limit: number = 10): Promise<SuggestedCreatorsResponse> {
  const query = `
    query GetSuggestedCreators($limit: Int) {
      suggestedCreators(limit: $limit) {
        id
        username
        avatarUrl
        bio
        stats {
          followersCount
          postsCount
          followingCount
        }
      }
    }
  `;

  const data = await graphqlRequest(query, { limit });
  return data?.suggestedCreators ?? [];
}

export async function searchUsers(query: string): Promise<SearchUsersResponse> {
  const gql = `
    query SearchUser($query: String!) {
      searchUser(query: $query) {
        id
        username
        avatarUrl
      }
    }
  `;

  const data = await graphqlRequest(gql, { query });
  return data?.searchUser ?? [];
}
