import { graphqlRequest } from "@/services/graphQL/graphqlClient";

/* =========================
   CIRCLE QUERIES
   ========================= */

export const GET_ALL_CIRCLES = `
  query GetAllCircles {
    allCircles {
      id
      name
      description
      coverImage
      memberCount
      isSubscribed
      createdAt
      rules {
        ruleNumber
        title
        description
      }
    }
  }
`;

export const GET_MY_CIRCLES = `
  query GetMyCircles {
    myCircles {
      id
      name
      description
      coverImage
      memberCount
      isSubscribed
      createdAt
      rules {
        ruleNumber
        title
        description
      }
    }
  }
`;

export const GET_SUGGESTED_CIRCLES = `
  query GetSuggestedCircles {
    suggestedCircles {
      id
      name
      description
      coverImage
      memberCount
      isSubscribed
      createdAt
    }
  }
`;

export const GET_CIRCLE_DETAIL = `
  query GetCircleDetail($id: String!) {
    circle(id: $id) {
      id
      name
      description
      coverImage
      memberCount
      isSubscribed
      createdAt
      rules {
        ruleNumber
        title
        description
      }
      activeAnchor {
        id
        title
        content
        anchorType
        mediaUrl
        createdAt
        expiresAt
      }
    }
  }
`;

export const GET_CIRCLE_FEED = `
  query GetCircleFeed($circleId: String!, $page: Int, $pageSize: Int) {
    circleFeed(circleId: $circleId, page: $page, pageSize: $pageSize) {
      pageInfo {
        currentPage
        hasNextPage
        totalCount
      }
      posts {
        id
        text
        image
        createdAt
        likesCount
        commentsCount
        prayedCount
        anchorLikedCount
        user {
          id
          name
          avatarUrl
        }
      }
    }
  }
`;

export const GET_ACTIVE_ANCHOR = `
  query GetActiveAnchor($circleId: String!) {
    activeAnchor(circleId: $circleId) {
      id
      title
      content
      anchorType
      mediaUrl
      createdAt
      expiresAt
      timeRemaining
      responseCount
      scriptureReference {
        book
        chapter
        verseStart
        verseEnd
        text
      }
      pages {
        pageNumber
        content
        mediaUrl
        title
      }
    }
  }
`;

export const GET_ANCHOR_HISTORY = `
  query GetAnchorHistory {
    anchorHistory {
      id
      title
      content
      anchorType
      mediaUrl
      createdAt
      expiresAt
      responseCount
    }
  }
`;

export const GET_ANCHOR_RESPONSES = `
  query GetAnchorResponses($anchorId: String!) {
    anchorResponses(anchorId: $anchorId) {
      id
      content
      responseType
      mediaType
      mediaUrl
      createdAt
      reactionCount
      replyCount
      viewerReactionType
      author {
        id
        username
        avatarUrl
      }
    }
  }
`;

/* =========================
   FETCHERS
   ========================= */

export async function fetchAllCircles() {
  const res = await graphqlRequest(GET_ALL_CIRCLES, {});
  return res?.allCircles ?? [];
}

export async function fetchMyCircles() {
  const res = await graphqlRequest(GET_MY_CIRCLES, {});
  return res?.myCircles ?? [];
}

export async function fetchSuggestedCircles() {
  const res = await graphqlRequest(GET_SUGGESTED_CIRCLES, {});
  return res?.suggestedCircles ?? [];
}

export async function fetchCircleDetail(id: string) {
  const res = await graphqlRequest(GET_CIRCLE_DETAIL, { id });
  return res?.circle ?? null;
}

export async function fetchCircleFeed(
  circleId: string,
  page = 1,
  pageSize = 20,
) {
  const res = await graphqlRequest(GET_CIRCLE_FEED, {
    circleId,
    page,
    pageSize,
  });
  return (
    res?.circleFeed ?? {
      pageInfo: { currentPage: 1, hasNextPage: false, totalCount: 0 },
      posts: [],
    }
  );
}

export async function fetchActiveAnchor(circleId: string) {
  const res = await graphqlRequest(GET_ACTIVE_ANCHOR, { circleId });
  return res?.activeAnchor ?? null;
}

export async function fetchAnchorHistory() {
  const res = await graphqlRequest(GET_ANCHOR_HISTORY, {});
  return res?.anchorHistory ?? [];
}

export async function fetchAnchorResponses(anchorId: string) {
  const res = await graphqlRequest(GET_ANCHOR_RESPONSES, { anchorId });
  return res?.anchorResponses ?? [];
}
