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
   DISCOVER FEED (USE REAL SHAPE)
 ========================= */

export const GET_DISCOVER_FEED = `
  query GetDiscoverFeed($category: String, $cursor: String, $limit: Int = 20) {
    discoverFeed(category: $category, cursor: $cursor, limit: $limit) {
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
          followedByAuthor
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
  cursor,
}: {
  category?: string;
  cursor?: string;
}) {
  const res = await graphqlRequest(
    GET_DISCOVER_FEED,
    {
      category,
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