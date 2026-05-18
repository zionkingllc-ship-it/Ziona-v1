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
      isJoined
      isSubscribed
      avatars
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
      isJoined
      isSubscribed
      avatars
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
      isJoined
      isSubscribed
      avatars
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
      bannerImage
      profileImage
      title
      image
      memberCount
      isJoined
      isSubscribed
      avatars
      memberAvatars
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
        anchorImage
        anchorText
        anchorVideo
        anchorThumbnail
        anchorImageText
        anchorLikedCount
        anchorVerse
        mediaUrl
        createdAt
        expiresAt
        timeRemaining
        responseCount
        prayedCount
        likedImage
        isActive
        publishedAt
        type
        backgroundColors
        backgroundImage
        bibleReference
        bibleText
        scripture
        scriptureReference {
          book
          chapter
          verseStart
          verseEnd
          text
          translation
        }
        pages {
          pageNumber
          content
          mediaUrl
          title
        }
      }
    }
  }
`;

export const GET_CIRCLE_FEED = `
  # Backend TODO: add $sortBy: String, $authorId: String params and pass them to circleFeed
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
        likes
        likesCount
        likeCount
        likedImage
        comments
        commentsCount
        prayedCount
        anchorLikedCount
        savedCount
        sharedCount
        user {
          id
          name
          avatar
          avatarUrl
        }
        viewerState {
          liked
          prayed
        }
      }
    }
  }
`;

export const GET_CIRCLE_FEED_DATA = `
  # Backend TODO: add $sortBy: String, $authorId: String params and pass to circleFeedData
  query GetCircleFeedData($circleId: String!, $historyLimit: Int, $page: Int, $pageSize: Int) {
    circleFeedData(circleId: $circleId, historyLimit: $historyLimit, page: $page, pageSize: $pageSize) {
      name
      description
      bannerImage
      profileImage
      memberCount
      isJoined
      memberAvatars
      activeAnchor {
        id
        title
        content
        anchorType
        anchorImage
        anchorText
        anchorVideo
        anchorThumbnail
        anchorLikedCount
        mediaUrl
        createdAt
        expiresAt
        timeRemaining
        responseCount
        prayedCount
        likedImage
        type
        backgroundColors
        backgroundImage
        bibleReference
        bibleText
        scripture
        scriptureReference {
          book
          chapter
          verseStart
          verseEnd
          text
          translation
        }
        pages {
          pageNumber
          content
          mediaUrl
          title
        }
        viewerState {
          liked
          prayed
        }
      }
      pastAnchors {
        id
        title
        content
        anchorType
        anchorImage
        createdAt
        expiresAt
        responseCount
        timeRemaining
      }
      posts {
        id
        text
        image
        createdAt
        likes
        likesCount
        likeCount
        likedImage
        comments
        commentsCount
        prayedCount
        anchorLikedCount
        savedCount
        sharedCount
        user {
          id
          name
          avatar
          avatarUrl
        }
        viewerState {
          liked
          prayed
        }
      }
      rules {
        ruleNumber
        title
        description
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
      anchorImage
      anchorText
      anchorVideo
      anchorThumbnail
      anchorImageText
      anchorLikedCount
      anchorVerse
      mediaUrl
      createdAt
      expiresAt
      timeRemaining
      responseCount
      prayedCount
      likedImage
      isActive
      publishedAt
      type
      backgroundColors
      backgroundImage
      bibleReference
      bibleText
      scripture
      scriptureReference {
        book
        chapter
        verseStart
        verseEnd
        text
        translation
      }
      pages {
        pageNumber
        content
        mediaUrl
        title
      }
      viewerState {
        liked
        prayed
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
      anchorImage
      anchorText
      anchorVideo
      anchorThumbnail
      anchorLikedCount
      mediaUrl
      createdAt
      expiresAt
      responseCount
      timeRemaining
      prayedCount
      type
      backgroundColors
      backgroundImage
      bibleReference
      bibleText
      scripture
      scriptureReference {
        book
        chapter
        verseStart
        verseEnd
        text
        translation
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

export const GET_ANCHOR_BY_DATE = `
  query GetAnchorByDate($circleId: String!, $date: String!) {
    anchorByDate(circleId: $circleId, date: $date) {
      id
      title
      content
      anchorType
      anchorImage
      anchorText
      anchorVideo
      anchorThumbnail
      anchorLikedCount
      mediaUrl
      createdAt
      expiresAt
      timeRemaining
      responseCount
      prayedCount
      type
      backgroundColors
      backgroundImage
      bibleReference
      bibleText
      scripture
      pages {
        pageNumber
        content
        mediaUrl
        title
      }
      viewerState {
        liked
        prayed
      }
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
    }
  }
`;

export const GET_ANCHOR = `
  query GetAnchor($id: String!) {
    anchor(id: $id) {
      id
      title
      content
      anchorType
      anchorImage
      anchorText
      anchorVideo
      anchorThumbnail
      anchorLikedCount
      mediaUrl
      createdAt
      expiresAt
      timeRemaining
      responseCount
      prayedCount
      likedImage
      type
      backgroundColors
      backgroundImage
      bibleReference
      bibleText
      scripture
      scriptureReference {
        book
        chapter
        verseStart
        verseEnd
        text
        translation
      }
      pages {
        pageNumber
        content
        mediaUrl
        title
      }
      viewerState {
        liked
        prayed
      }
    }
  }
`;

export const GET_CIRCLE_POST = `
  query GetCirclePost($id: String!) {
    circlePost(id: $id) {
      id
      text
      image
      createdAt
      likes
      likesCount
      likeCount
      likedImage
      comments
      commentsCount
      prayedCount
      savedCount
      sharedCount
      user {
        id
        name
        avatar
        avatarUrl
      }
      viewerState {
        liked
        prayed
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
  sortBy?: string,
  authorId?: string,
) {
  const res = await graphqlRequest(GET_CIRCLE_FEED, {
    circleId,
    page,
    pageSize,
    // Backend TODO: uncomment when API supports sortBy/authorId
    // sortBy: sortBy || undefined,
    // authorId: authorId || undefined,
  });
  return (
    res?.circleFeed ?? {
      pageInfo: { currentPage: 1, hasNextPage: false, totalCount: 0 },
      posts: [],
    }
  );
}

export async function fetchCircleFeedData(
  circleId: string,
  historyLimit?: number,
  page = 1,
  pageSize = 20,
  sortBy?: string,
  authorId?: string,
) {
  const res = await graphqlRequest(GET_CIRCLE_FEED_DATA, {
    circleId,
    historyLimit: historyLimit ?? 10,
    page,
    pageSize,
    // Backend TODO: uncomment when API supports sortBy/authorId
    // sortBy: sortBy || undefined,
    // authorId: authorId || undefined,
  });
  return res?.circleFeedData ?? null;
}

export async function fetchActiveAnchor(circleId: string) {
  console.log("🔍 [queries] fetchActiveAnchor called for circleId:", circleId);
  const res = await graphqlRequest(GET_ACTIVE_ANCHOR, { circleId });
  console.log("🔍 [queries] fetchActiveAnchor result:", res?.activeAnchor);
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

export async function fetchAnchor(id: string) {
  const res = await graphqlRequest(GET_ANCHOR, { id });
  return res?.anchor ?? null;
}

export async function fetchAnchorByDate(circleId: string, date: string) {
  const res = await graphqlRequest(GET_ANCHOR_BY_DATE, { circleId, date });
  return res?.anchorByDate ?? null;
}

export async function fetchCirclePost(id: string) {
  const res = await graphqlRequest(GET_CIRCLE_POST, { id });
  return res?.circlePost ?? null;
}
