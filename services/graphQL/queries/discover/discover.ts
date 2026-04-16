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
      bdColor
      order
    }
  }
`;

/* =========================
   DISCOVER FEED (USE REAL SHAPE)
========================= */

export const GET_DISCOVER_FEED = `
  query GetDiscoverFeed($cursor: String, $limit: Int = 20) {
    forYouFeed(cursor: $cursor, limit: $limit) {
      hasMore
      nextCursor
      posts {
        id
        type
        caption
        createdAt

        category {
          id
          label
          slug
          bgColor
          bdColor
        }

        author {
          id
          username
          avatarUrl
        }

        image {
          items {
            url
            thumbnailUrl
          }
        }

        video {
          url
          thumbnailUrl
        }

        text

        scripture {
          book
          chapter
          verseStart
          verseEnd
          translation
          text
        }

        stats {
          likesCount
          commentsCount
          sharesCount
          savesCount
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
  cursor,
}: {
  cursor?: string;
}) {
  const res = await graphqlRequest(
    GET_DISCOVER_FEED,
    {
      cursor,
      limit: 20,
    }
  );

  return res?.forYouFeed ?? {
    posts: [],
    nextCursor: undefined,
    hasMore: false,
  };
}