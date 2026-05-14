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
  mutation CreateCirclePost($circleId: String!, $text: String, $image: String, $mediaUrl: String) {
    createCirclePost(circleId: $circleId, text: $text, image: $image, mediaUrl: $mediaUrl) {
      success
      error {
        code
        message
      }
      post {
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
  mutation RespondToAnchor($anchorId: String!, $content: String!, $responseType: String!, $mediaType: String, $mediaUrl: String) {
    respondToAnchor(anchorId: $anchorId, content: $content, responseType: $responseType, mediaType: $mediaType, mediaUrl: $mediaUrl) {
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
        mediaUrl
        createdAt
      }
    }
  }
`;

export const REPORT_CIRCLE_CONTENT = `
  mutation ReportCircleContent($circleId: String!, $targetId: String!, $reason: String!, $targetType: String!) {
    reportCircleContent(circleId: $circleId, targetId: $targetId, reason: $reason, targetType: $targetType) {
      success
      error {
        code
        message
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
  text?: string,
  image?: string,
  mediaUrl?: string
) {
  const res = await graphqlRequest(CREATE_CIRCLE_POST, {
    circleId,
    text,
    image,
    mediaUrl,
  });
  return res?.createCirclePost;
}

export async function prayForCirclePost(postId: string) {
  const res = await graphqlRequest(PRAY_FOR_CIRCLE_POST, { postId });
  return res?.prayForCirclePost;
}

export async function respondToAnchor(
  anchorId: string,
  content: string,
  responseType: string,
  mediaType?: string,
  mediaUrl?: string
) {
  const res = await graphqlRequest(RESPOND_TO_ANCHOR, {
    anchorId,
    content,
    responseType,
    mediaType,
    mediaUrl,
  });
  return res?.respondToAnchor;
}

export async function reportCircleContent(
  circleId: string,
  targetId: string,
  reason: string,
  targetType: string
) {
  const res = await graphqlRequest(REPORT_CIRCLE_CONTENT, {
    circleId,
    targetId,
    reason,
    targetType,
  });
  return res?.reportCircleContent;
}
