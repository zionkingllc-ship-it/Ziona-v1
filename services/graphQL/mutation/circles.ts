import { graphqlRequest } from "@/services/graphQL/graphqlClient";

/* =========================
   CIRCLE MUTATIONS
   ========================= */

export const JOIN_CIRCLE = `
  mutation JoinCircle($circleId: String!) {
    joinCircle(circleId: $circleId) {
      success
      error {
        code
        message
      }
      circle {
        id
        name
        isSubscribed
        memberCount
      }
    }
  }
`;

export const LEAVE_CIRCLE = `
  mutation LeaveCircle($circleId: String!) {
    leaveCircle(circleId: $circleId) {
      success
      error {
        code
        message
      }
      circle {
        id
        name
        isSubscribed
        memberCount
      }
    }
  }
`;

export const CREATE_CIRCLE_POST = `
  mutation CreateCirclePost($circleId: String!, $text: String, $mediaIds: [String!], $mediaType: MediaType) {
    createCirclePost(circleId: $circleId, text: $text, mediaIds: $mediaIds, mediaType: $mediaType) {
      success
      error {
        code
        message
      }
      post {
        id
        text
        media {
          id
          url
          thumbnailUrl
          type
          width
          height
          duration
        }
        mediaType
      }
    }
  }
`;

export const PRAY_FOR_CIRCLE_POST = `
  mutation PrayForCirclePost($postId: String!) {
    prayForCirclePost(postId: $postId) {
      success
      prayed
      prayedCount
      error {
        code
        message
      }
    }
  }
`;

export const RESPOND_TO_ANCHOR = `
  mutation RespondToAnchor($anchorId: String!, $content: String!, $responseType: String!, $mediaType: String) {
    respondToAnchor(anchorId: $anchorId, content: $content, responseType: $responseType, mediaType: $mediaType) {
      success
      error {
        code
        message
      }
      response {
        id
        content
        responseType
        mediaType
        # mediaUrl
        createdAt
      }
    }
  }
`;

/* =========================
   ACTION FUNCTIONS
   ========================= */

export async function joinCircle(circleId: string) {
  const res = await graphqlRequest(JOIN_CIRCLE, { circleId });
  return res?.joinCircle;
}

export async function leaveCircle(circleId: string) {
  const res = await graphqlRequest(LEAVE_CIRCLE, { circleId });
  return res?.leaveCircle;
}

export async function createCirclePost(
  circleId: string,
  text: string,
  mediaIds: string[],
  mediaType: string,
) {
  const res = await graphqlRequest(CREATE_CIRCLE_POST, {
    circleId,
    text,
    mediaIds,
    mediaType,
  });
  return res?.createCirclePost;
}

export async function prayForCirclePost(postId: string) {
  const res = await graphqlRequest(PRAY_FOR_CIRCLE_POST, { postId });
  return res?.prayForCirclePost;
}

export const LIKE_CIRCLE_POST = `
  mutation LikeCirclePost($postId: String!) {
    likeCirclePost(postId: $postId) {
      success
      liked
      likesCount
      error {
        code
        message
      }
    }
  }
`;

export async function likeCirclePost(postId: string) {
  const res = await graphqlRequest(LIKE_CIRCLE_POST, { postId });
  return res?.likeCirclePost;
}

export const LIKE_ANCHOR = `
  mutation LikeAnchor($anchorId: String!) {
    likeAnchor(anchorId: $anchorId) {
      success
      liked
      anchorLikedCount
      error {
        code
        message
      }
    }
  }
`;

export const ENSURE_CIRCLE_POST_LIKED = `
  mutation EnsureCirclePostLiked($postId: String!) {
    ensureCirclePostLiked(postId: $postId) {
      success
      liked
      likesCount
      error {
        code
        message
      }
    }
  }
`;

export async function ensureCirclePostLiked(postId: string) {
  const res = await graphqlRequest(ENSURE_CIRCLE_POST_LIKED, { postId });
  return res?.ensureCirclePostLiked;
}

export async function likeAnchor(anchorId: string) {
  const res = await graphqlRequest(LIKE_ANCHOR, { anchorId });
  return res?.likeAnchor;
}

export async function respondToAnchor(
  anchorId: string,
  content: string,
  responseType: string,
  mediaType?: string,
  // mediaUrl?: string
) {
  const res = await graphqlRequest(RESPOND_TO_ANCHOR, {
    anchorId,
    content,
    responseType,
    mediaType,
    // mediaUrl,
  });
  return res?.respondToAnchor;
}


