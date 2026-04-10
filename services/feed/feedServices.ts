import { graphqlRequest } from "@/services/graphQL/graphqlClient";

const GET_FOR_YOU_FEED = `
query GetForYouFeed($cursor: String, $limit: Int = 20) {
  forYouFeed(cursor: $cursor, limit: $limit) {
    hasMore
    nextCursor
    emptyState { message suggestions { id username avatarUrl } }
    posts {
      id type caption createdAt
      category { id label slug icon bgColor bdColor textPostBg order }
      author { id username avatarUrl }
      image { items { id url thumbnailUrl width height } }
      video { url thumbnailUrl duration width height }
      text
      scripture { book chapter verseStart verseEnd translation text }
      stats { likesCount commentsCount sharesCount savesCount }
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
      id type caption createdAt
      category { id label slug icon bgColor bdColor order textPostBg}
      author { id username avatarUrl }
      image { items { id url thumbnailUrl width height } }
      video { url thumbnailUrl duration width height }
      text
      scripture { book chapter verseStart verseEnd translation text }
      stats { likesCount commentsCount sharesCount savesCount }
      viewerState { liked saved followingAuthor isOwner }
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
    console.log("[FEED][FOR_YOU] 🚀 Request start", {
      cursor: pageParam,
    });

    const data = await graphqlRequest(GET_FOR_YOU_FEED, {
      cursor: pageParam,
      limit: 20,
    });

    console.log("[FEED][FOR_YOU] ✅ Raw response", data);

    const feed = data?.forYouFeed;

    if (!feed) {
      console.warn("[FEED][FOR_YOU] ⚠️ Missing forYouFeed in response");
    }

    const rawPosts = feed?.posts ?? [];

    console.log("[FEED][FOR_YOU] 📦 Posts received", {
      count: rawPosts?.length,
      hasMore: feed?.hasMore,
      nextCursor: feed?.nextCursor,
    });

    return {
      posts: Array.isArray(rawPosts) ? rawPosts : [],
      nextCursor: feed?.nextCursor ?? undefined,
      hasMore: Boolean(feed?.hasMore),
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
}> {
  try {
    console.log("[FEED][FOLLOWING] 🚀 Request start", {
      cursor: pageParam,
    });

    const data = await graphqlRequest(GET_FOLLOWING_FEED, {
      cursor: pageParam,
      limit: 20,
    });

    console.log("[FEED][FOLLOWING] ✅ Raw response", data);

    const feed = data?.followingFeed;

    if (!feed) {
      console.warn("[FEED][FOLLOWING] ⚠️ Missing followingFeed in response");
    }

    const rawPosts = feed?.posts ?? [];

    console.log("[FEED][FOLLOWING] 📦 Posts received", {
      count: rawPosts?.length,
      hasMore: feed?.hasMore,
      nextCursor: feed?.nextCursor,
    });

    return {
      posts: Array.isArray(rawPosts) ? rawPosts : [],
      nextCursor: feed?.nextCursor ?? undefined,
      hasMore: Boolean(feed?.hasMore),
    };
  } catch (error) {
    console.error("[FEED][FOLLOWING] ❌ Request failed", error);
    throw error;
  }
}