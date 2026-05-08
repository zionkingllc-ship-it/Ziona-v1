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
  mutation CreateCirclePost($circleId: String!, $text: String!, $mediaId: String) {
    createCirclePost(circleId: $circleId, text: $text, mediaId: $mediaId) {
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
        likesCount
        commentsCount
        prayedCount
        user {
          id
          name
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
  mutation RespondToAnchor($anchorId: String!, $content: String!, $responseType: String!, $mediaId: String) {
    respondToAnchor(anchorId: $anchorId, content: $content, responseType: $responseType, mediaId: $mediaId) {
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
        author {
          id
          username
          avatarUrl
        }
      }
    }
  }
`;

export const REPORT_CIRCLE_CONTENT = `
  mutation ReportCircleContent($circleId: String!, $contentId: String!, $reason: String!, $description: String) {
    reportCircleContent(circleId: $circleId, contentId: $contentId, reason: $reason, description: $description) {
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

export async function createCirclePost(circleId: string, text: string, mediaId?: string) {
  const res = await graphqlRequest(CREATE_CIRCLE_POST, { circleId, text, mediaId });
  return res?.createCirclePost;
}

export async function prayForCirclePost(postId: string) {
  const res = await graphqlRequest(PRAY_FOR_CIRCLE_POST, { postId });
  return res?.prayForCirclePost;
}

export async function respondToAnchor(anchorId: string, content: string, responseType: string, mediaId?: string) {
  const res = await graphqlRequest(RESPOND_TO_ANCHOR, { anchorId, content, responseType, mediaId });
  return res?.respondToAnchor;
}

export async function reportCircleContent(circleId: string, contentId: string, reason: string, description?: string) {
  const res = await graphqlRequest(REPORT_CIRCLE_CONTENT, { circleId, contentId, reason, description });
  return res?.reportCircleContent;
}
