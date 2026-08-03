import { graphqlRequest } from "@/services/graphQL/graphqlClient";

const GET_FOR_YOU_FEED = `
query GetForYouFeed($cursor: String, $limit: Int = 20) {
  forYouFeed(cursor: $cursor, limit: $limit) {
    hasMore
    nextCursor
    emptyState { message suggestions { id username bio followersCount } }
    posts {
      id type caption createdAt shareUrl
      category { slug textPostBg bgColor id label }
      textMessage
      bibleMessage
      scripture { verses { text number } verseEnd verseStart translation book chapter reference }
      author { id username avatarUrl }
      image { items { id url thumbnailUrl type } }
      video { url thumbnailUrl }
      stats { likesCount commentsCount savesCount sharesCount }
      viewerState { liked saved followingAuthor isOwner }
    }
  }
}
`;

const GET_FOLLOWING_FEED = `
query GetFollowingFeed($cursor: String, $limit: Int = 20) {
  followingFeed(cursor: $cursor, limit: $limit) {
    hasMore
    nextCursor
    posts {
      id type caption createdAt shareUrl
      category { slug textPostBg bgColor id label }
      textMessage
      bibleMessage
      scripture { verses { text number } verseEnd verseStart translation book chapter reference }
      author { id username avatarUrl }
      image { items { id url thumbnailUrl type } }
      video { url thumbnailUrl }
      stats { likesCount commentsCount savesCount sharesCount }
      viewerState { liked saved followingAuthor isOwner }
    }
    emptyState {
      message
      suggestions { id username bio followersCount }
    }
  }
}
`;

export async function fetchForYouFeed({
  pageParam,
}: {
  pageParam?: string;
}): Promise<{
  posts: any[];
  nextCursor?: string;
  hasMore: boolean;
}> {
  try {
    const data = await graphqlRequest(GET_FOR_YOU_FEED, {
      cursor: pageParam,
      limit: 20,
    });

    const feed = data?.forYouFeed;

    const rawPosts = feed?.posts ?? [];

    return {
      posts: Array.isArray(rawPosts) ? rawPosts : [],
      nextCursor: feed?.nextCursor ?? undefined,
      hasMore: Boolean(feed?.hasMore),
      emptyState: feed?.emptyState
        ? {
            message: feed.emptyState.message,
            suggestions: feed.emptyState.suggestions,
          }
        : undefined,
    };
  } catch (error) {
    console.error("[FEED][FOR_YOU] ❌ Request failed", error);
    throw error;
  }
}

export async function fetchFollowingFeed({
  pageParam,
}: {
  pageParam?: string;
}): Promise<{
  posts: any[];
  nextCursor?: string;
  hasMore: boolean;
  emptyState?: {
    message?: string;
    suggestions?: { id: string; username: string; bio?: string; followersCount: number }[];
  };
}> {
  try {
    const data = await graphqlRequest(GET_FOLLOWING_FEED, {
      cursor: pageParam,
      limit: 20,
    });

    const feed = data?.followingFeed;

    const rawPosts = feed?.posts ?? [];

    return {
      posts: Array.isArray(rawPosts) ? rawPosts : [],
      nextCursor: feed?.nextCursor ?? undefined,
      hasMore: Boolean(feed?.hasMore),
      emptyState: feed?.emptyState
        ? {
            message: feed.emptyState.message,
            suggestions: feed.emptyState.suggestions,
          }
        : undefined,
    };
  } catch (error) {
    console.error("[FEED][FOLLOWING] ❌ Request failed", error);
    throw error;
  }
}