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
        isExpired
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
        author {
          id
          username
          avatarUrl
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
        isExpired
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
      isExpired
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
      author {
        id
        username
        avatarUrl
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
      isExpired
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
      author {
        id
        username
        avatarUrl
      }
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
      isExpired
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
      author {
        id
        username
        avatarUrl
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
  const circles = res?.allCircles ?? [];
  if (circles.length > 0) {
    console.log("🔍 [API] fetchAllCircles sample circle:", JSON.stringify({
      id: circles[0].id,
      name: circles[0].name,
      coverImage: circles[0].coverImage ? "has value" : "empty",
      bannerImage: circles[0].bannerImage ? "has value" : "empty",
      profileImage: circles[0].profileImage ? "has value" : "empty",
      memberCount: circles[0].memberCount,
    }));
  } else {
    console.log("🔍 [API] fetchAllCircles: empty array returned");
  }
  return circles;
}

export async function fetchMyCircles() {
  const res = await graphqlRequest(GET_MY_CIRCLES, {});
  const circles = res?.myCircles ?? [];
  console.log("🔍 [API] fetchMyCircles count:", circles.length);
  return circles;
}

export async function fetchSuggestedCircles() {
  const res = await graphqlRequest(GET_SUGGESTED_CIRCLES, {});
  return res?.suggestedCircles ?? [];
}

export async function fetchCircleDetail(id: string) {
  console.log("🔍 [API] fetchCircleDetail for id:", id);
  const res = await graphqlRequest(GET_CIRCLE_DETAIL, { id });
  console.log("🔍 [API] fetchCircleDetail response:", JSON.stringify({
    hasData: !!res?.circle,
    bannerImage: res?.circle?.bannerImage ? res.circle.bannerImage.substring(0, 80) + "..." : "null/empty",
    coverImage: res?.circle?.coverImage ? res.circle.coverImage.substring(0, 80) + "..." : "null/empty",
    profileImage: res?.circle?.profileImage ? "has value" : "null/empty",
    name: res?.circle?.name,
    memberCount: res?.circle?.memberCount,
    hasActiveAnchor: !!res?.circle?.activeAnchor,
  }));
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
  console.log("🔍 [API] fetchCircleFeedData called:", JSON.stringify({ circleId, historyLimit, page, pageSize, sortBy, authorId }));
  const res = await graphqlRequest(GET_CIRCLE_FEED_DATA, {
    circleId,
    historyLimit: historyLimit ?? 10,
    page,
    pageSize,
  });
  console.log("🔍 [API] fetchCircleFeedData response:", JSON.stringify({
    hasData: !!res?.circleFeedData,
    bannerImage: res?.circleFeedData?.bannerImage ? res.circleFeedData.bannerImage.substring(0, 80) + "..." : "null/empty",
    profileImage: res?.circleFeedData?.profileImage ? "has value" : "null/empty",
    coverImage: res?.circleFeedData?.coverImage ? "has value" : "null/missing",
    name: res?.circleFeedData?.name,
    memberCount: res?.circleFeedData?.memberCount,
    isJoined: res?.circleFeedData?.isJoined,
    postsCount: res?.circleFeedData?.posts?.length,
    pastAnchorsCount: res?.circleFeedData?.pastAnchors?.length,
  }));
  return res?.circleFeedData ?? null;
}

function mapActiveAnchor(raw: any): any {
  if (!raw) return null;
  return {
    ...raw,
    type: raw.anchorType,
  };
}

export async function fetchActiveAnchor(circleId: string) {
  console.log("🔍 [queries] fetchActiveAnchor called for circleId:", circleId);
  const res = await graphqlRequest(GET_ACTIVE_ANCHOR, { circleId });
  console.log("🔍 [queries] fetchActiveAnchor result:", res?.activeAnchor);
  return mapActiveAnchor(res?.activeAnchor ?? null);
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
  return mapActiveAnchor(res?.anchorByDate ?? null);
}

export async function fetchCirclePost(id: string) {
  const res = await graphqlRequest(GET_CIRCLE_POST, { id });
  return res?.circlePost ?? null;
}
