import { graphqlRequest } from "@/services/graphQL/graphqlClient";

/* =========================
   CATEGORIES
 ========================= */

export const GET_DISCOVER_CATEGORIES = `
  query GetDiscoverCategories {
    discoverCategories {
      id
      label
      slug
      icon
      bgColor
      textPostBg
    }
  }
`;

/* =========================
   DISCOVER SEARCH
 ========================= */

export const GET_DISCOVER_SEARCH = `
  query DiscoverSearch($query: String!, $category: String, $mediaType: String, $cursor: String, $limit: Int = 20) {
    discoverSearch(query: $query, category: $category, mediaType: $mediaType, cursor: $cursor, limit: $limit) {
      creators {
        id
        username
        avatarUrl
        bio
        stats {
          followersCount
          followingCount
          postsCount
        }
        isFollowing
      }
      posts {
        id
        type
        caption
        createdAt
        shareUrl
        category { slug textPostBg bgColor id label }

        textMessage
        bibleMessage

        author {
          id
          username
          avatarUrl
        }

        image {
          items {
            url
            thumbnailUrl
            type
          }
        }

        video {
          url
          thumbnailUrl
        }

        scripture {
          verses { text number }
          verseEnd
          verseStart
          translation
          book
          chapter
          reference
        }

        stats {
          likesCount
          commentsCount
          savesCount
          sharesCount
        }

        viewerState {
          liked
          saved
          followingAuthor
          isOwner
        }
      }
      nextCursor
      hasMore
      creatorCount
      postCount
    }
  }
`;

/* =========================
   DISCOVER FEED (USE REAL SHAPE)
 ========================= */

export const GET_DISCOVER_FEED = `
  query GetDiscoverFeed($category: String, $mediaType: String, $cursor: String, $limit: Int = 20) {
    discoverFeed(category: $category, mediaType: $mediaType, cursor: $cursor, limit: $limit) {
      hasMore
      nextCursor
      posts {
        id
        type
        caption
        createdAt
        shareUrl
        category { slug textPostBg bgColor id label }

        textMessage
        bibleMessage

        author {
          id
          username
          avatarUrl
        }

        image {
          items {
            url
            thumbnailUrl
            type
          }
        }

        video {
          url
          thumbnailUrl
        }

        scripture {
          verses { text number }
          verseEnd
          verseStart
          translation
          book
          chapter
          reference
        }

        stats {
          likesCount
          commentsCount
          savesCount
          sharesCount
        }

        viewerState {
          liked
          saved
          followingAuthor
          isOwner
        }
      }
    }
  }
`;

/* =========================
   FETCHERS
 ========================= */

export async function fetchDiscoverCategories() {
  const res = await graphqlRequest(GET_DISCOVER_CATEGORIES, {});
  return res?.discoverCategories ?? [];
}

export async function fetchDiscoverFeed({
  category,
  mediaType,
  cursor,
}: {
  category?: string;
  mediaType?: string;
  cursor?: string;
}) {
  const res = await graphqlRequest(
    GET_DISCOVER_FEED,
    {
      category,
      mediaType,
      cursor,
      limit: 20,
    }
  );

  return res?.discoverFeed ?? {
    posts: [],
    nextCursor: undefined,
    hasMore: false,
  };
}

export async function fetchDiscoverSearch({
  query,
  category,
  mediaType,
  cursor,
}: {
  query: string;
  category?: string;
  mediaType?: string;
  cursor?: string;
}) {
  const res = await graphqlRequest(
    GET_DISCOVER_SEARCH,
    {
      query,
      category,
      mediaType,
      cursor,
      limit: 20,
    }
  );

  return res?.discoverSearch ?? {
    creators: [],
    posts: [],
    nextCursor: undefined,
    hasMore: false,
    creatorCount: 0,
    postCount: 0,
  };
}