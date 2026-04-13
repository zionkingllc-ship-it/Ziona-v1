import { graphqlRequest } from "@/services/graphQL/graphqlClient";

export type FollowUser = {
  id: string;
  username: string;
  avatarUrl?: string | null;
  bio?: string;
  stats?: {
    followersCount: number;
  };
};

export type FollowersResponse = {
  hasMore: boolean;
  cursor?: string;
  users: FollowUser[];
};

export type FollowingResponse = {
  hasMore: boolean;
  cursor?: string;
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
  };
}[];

const USER_FRAGMENT = `
  id
  username
  avatarUrl
  bio
  stats {
    followersCount
  }
`;

export async function getFollowers(
  userId: string,
  cursor?: string
): Promise<FollowersResponse> {
  const query = `
    query GetFollowers($userId: String!, $cursor: String) {
      followers(userId: $userId, cursor: $cursor) {
        hasMore
        cursor
        users {
          ${USER_FRAGMENT}
        }
      }
    }
  `;

  const data = await graphqlRequest(query, { userId, cursor });
  return data?.followers ?? { hasMore: false, users: [] };
}

export async function getFollowing(
  userId: string,
  cursor?: string
): Promise<FollowingResponse> {
  const query = `
    query GetFollowing($userId: String!, $cursor: String) {
      following(userId: $userId, cursor: $cursor) {
        hasMore
        cursor
        users {
          ${USER_FRAGMENT}
        }
      }
    }
  `;

  const data = await graphqlRequest(query, { userId, cursor });
  return data?.following ?? { hasMore: false, users: [] };
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

export async function getSuggestedCreators(): Promise<SuggestedCreatorsResponse> {
  const query = `
    query GetSuggestedCreators {
      suggestedCreators {
        ${USER_FRAGMENT}
      }
    }
  `;

  const data = await graphqlRequest(query);
  return data?.suggestedCreators ?? [];
}
