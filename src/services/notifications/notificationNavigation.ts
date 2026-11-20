export type NotificationHref = { pathname: string; params?: Record<string, string> };

const VIEWER_ROUTES = ["/viewer/", "/viewer"];
const CIRCLE_FEED_ROUTES = ["/circleFeed?id=", "/circleFeed"];
const GUEST_ROUTES = ["/guest?userId=", "/guest"];

function toHrefFromParts(
  route: string,
  entityId: string | undefined,
  isComment: boolean,
  secondaryEntityId?: string,
  entityType?: string,
  // Explicit circle id from the backend (NotificationDestinationType.circleId).
  // Takes precedence over the legacy secondaryEntityId overload.
  circleId?: string,
): NotificationHref | null {
  // The backend's destination routes are symbolic names ("post_detail",
  // "comment_thread", ...), not URL paths. Resolve those first: previously a
  // comment push fell through to the reference-type fallback and opened the
  // post with the comments sheet closed.
  const routeKey = route.trim().toLowerCase();

  if (routeKey === "post_detail" || routeKey === "post") {
    if (!entityId) return null;
    return { pathname: `/viewer/${entityId}`, params: { postId: entityId } };
  }

  if (routeKey === "comment_thread" || routeKey === "comment") {
    // entityId is the comment, secondaryEntityId is its parent post.
    const postId = secondaryEntityId || entityId;
    if (!postId) return null;
    const params: Record<string, string> = { postId, openComments: "1" };
    if (secondaryEntityId && entityId && entityId !== postId) {
      params.commentId = entityId;
    }
    return { pathname: `/viewer/${postId}`, params };
  }

  if (routeKey === "profile" || routeKey === "user") {
    if (!entityId) return null;
    return { pathname: "/guest", params: { userId: entityId } };
  }

  if (routeKey === "circle_post_detail" || routeKey === "circle_post") {
    if (!entityId) return null;
    return {
      pathname: "/posts/[id]",
      params: { postId: entityId, ...(circleId ? { circleId } : {}) },
    };
  }

  if (routeKey === "circle_post_comment_thread" || routeKey === "circle_post_comment") {
    // secondaryEntityId is the parent circle post, entityId is the comment.
    if (secondaryEntityId) {
      return {
        pathname: "/posts/[id]",
        params: {
          postId: secondaryEntityId,
          openComments: "1",
          ...(entityId ? { commentId: entityId } : {}),
          ...(circleId ? { circleId } : {}),
        },
      };
    }
    if (circleId) return { pathname: "/circleFeed", params: { id: circleId } };
    return null;
  }

  if (routeKey === "anchor_response") {
    // secondaryEntityId is the anchor the response belongs to, entityId the
    // response itself. Anchor views need the anchor id, not the response id.
    const anchorId = secondaryEntityId || entityId;
    if (!anchorId || !circleId) {
      return circleId ? { pathname: "/circleFeed", params: { id: circleId } } : null;
    }
    return {
      pathname: "/(tabs)/circle/anchorUnifiedView",
      params: { id: anchorId, circleId, source: "notification" },
    };
  }

  if (routeKey === "anchor_detail" || routeKey === "anchor") {
    if (entityId && circleId) {
      return {
        pathname: "/(tabs)/circle/anchorUnifiedView",
        params: { id: entityId, circleId, source: "notification" },
      };
    }
    return circleId ? { pathname: "/circleFeed", params: { id: circleId } } : null;
  }

  if (routeKey === "notification_detail" || routeKey === "support_ticket") {
    return { pathname: "/notifications" };
  }

  if (route.startsWith("/post/") || route.startsWith("/posts/")) {
    const id =
      entityId ||
      route.replace(/^\/posts?\//, "").split(/[/?&]/)[0] ||
      undefined;
    if (!id) return null;
    return { pathname: `/viewer/${id}`, params: { postId: id } };
  }

  if (VIEWER_ROUTES.some((r) => route.startsWith(r))) {
    const id =
      (isComment ? secondaryEntityId : undefined) ||
      entityId ||
      route.replace(/^\/viewer\/?/, "").split("?")[0] ||
      undefined;
    if (!id) return null;
    return { pathname: `/viewer/${id}`, params: { postId: id } };
  }

  if (CIRCLE_FEED_ROUTES.some((r) => route.startsWith(r))) {
    const routeId = route.match(/^\/circleFeed\?id=([^&]*)/)?.[1] || undefined;
    const id =
      routeId ||
      circleId ||
      (entityType === "anchor" || entityType === "circle_post"
        ? secondaryEntityId
        : entityId);
    if (!id) return null;
    return { pathname: "/circleFeed", params: { id } };
  }

  if (route.toLowerCase().includes("anchor")) {
    const resolvedCircleId = circleId || secondaryEntityId;
    if (!resolvedCircleId) return null;
    if (!entityId) return { pathname: "/circleFeed", params: { id: resolvedCircleId } };
    return {
      pathname: "/(tabs)/circle/anchorUnifiedView",
      params: { id: entityId || "", circleId: resolvedCircleId, source: "notification" },
    };
  }

  if (GUEST_ROUTES.some((r) => route.startsWith(r))) {
    const id = entityId || route.replace(/^\/guest\?userId=?/, "").split("&")[0] || undefined;
    if (!id) return null;
    return { pathname: "/guest", params: { userId: id } };
  }

  return null;
}

/**
 * Read a string field that may arrive under its plain key (`route`) or the
 * flat push-payload alias (`destinationRoute`). FCM data payloads are flat
 * string maps, so the backend sends destination* keys there.
 */
function pickStr(data: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value) return value;
  }
  return undefined;
}

function resolveDestination(data?: Record<string, unknown> | null): NotificationHref | null {
  if (!data) return null;

  // 1. Top-level route/entityId (from push notification payload, which uses
  // flat destination* keys: destinationRoute, destinationEntityId, ...)
  const entityId = pickStr(data, "entityId", "destinationEntityId");
  const route = pickStr(data, "route", "destinationRoute");

  if (route && entityId) {
    const entityType = pickStr(data, "entityType", "destinationEntityType");
    const isComment =
      entityType === "comment" || data.referenceType === "comment";
    const href = toHrefFromParts(
      route,
      entityId,
      isComment,
      pickStr(data, "secondaryEntityId", "destinationSecondaryEntityId"),
      entityType,
      pickStr(data, "circleId", "destinationCircleId"),
    );
    if (href) return href;
  }

  // 2. Nested destination object (from GraphQL NotificationItem)
  const dest = data.destination as Record<string, unknown> | undefined;
  if (dest) {
    const destRoute = typeof dest.route === "string" ? dest.route : undefined;
    const destEntityId =
      typeof dest.entityId === "string" ? dest.entityId : undefined;
    const destSecondaryEntityId =
      typeof dest.secondaryEntityId === "string" ? dest.secondaryEntityId : undefined;
    const destCircleId =
      typeof dest.circleId === "string" ? dest.circleId : undefined;
    if (destRoute) {
      const isComment =
        dest.entityType === "comment" || data.referenceType === "comment";
      const href = toHrefFromParts(
        destRoute,
        destEntityId,
        isComment,
        destSecondaryEntityId,
        typeof dest.entityType === "string" ? dest.entityType : undefined,
        destCircleId,
      );
      if (href) return href;
    }
  }

  // In-app notifications always use typed IDs. Deep links may be web URLs and
  // are intentionally ignored here.
  // 3. Fallback: referenceType/referenceId map
  const referenceType =
    typeof data.referenceType === "string" ? data.referenceType : undefined;
  const referenceId =
    typeof data.referenceId === "string" || typeof data.referenceId === "number"
      ? String(data.referenceId)
      : undefined;

  if (!referenceType || !referenceId) return null;

  // Legacy rows may still carry "Anchor" / "ContactMessage"; the backend
  // normalises new rows, so compare a lowercase, punctuation-free key.
  const referenceTypeKey = referenceType.toLowerCase().replace(/[^a-z0-9]/g, "");

  // Nested destination object (may exist without a route when only
  // reference fields were sent). Reused by the comment/circle fallbacks below.
  const fallbackDest = data.destination as Record<string, unknown> | undefined;
  const destSecondaryId =
    fallbackDest && typeof fallbackDest.secondaryEntityId === "string"
      ? fallbackDest.secondaryEntityId
      : undefined;
  const destCircleId =
    fallbackDest && typeof fallbackDest.circleId === "string"
      ? fallbackDest.circleId
      : undefined;

  switch (referenceTypeKey) {
    case "post":
    case "like":
    case "likepost":
    case "mention": {
      const params: Record<string, string> = { postId: referenceId };
      return { pathname: `/viewer/${referenceId}`, params };
    }
    case "comment": {
      // referenceId is the COMMENT id — /viewer/ needs the parent POST id,
      // which the backend carries in secondaryEntityId (flat or nested).
      // Circle-nested comments route to their circle instead.
      const circleId =
        pickStr(data, "circleId", "destinationCircleId") ?? destCircleId;
      if (circleId) return { pathname: "/circleFeed", params: { id: circleId } };
      const postId =
        pickStr(data, "secondaryEntityId", "destinationSecondaryEntityId") ??
        destSecondaryId;
      if (!postId) return null;
      return { pathname: `/viewer/${postId}`, params: { postId } };
    }
    case "user":
    case "follow":
    case "profile":
      return { pathname: "/guest", params: { userId: referenceId } };
    case "circle":
      return { pathname: "/circleFeed", params: { id: referenceId } };
    case "circlepost": {
      const circleId =
        pickStr(data, "circleId", "destinationCircleId") ??
        pickStr(data, "secondaryEntityId", "destinationSecondaryEntityId") ??
        destSecondaryId;
      return circleId ? { pathname: "/circleFeed", params: { id: circleId } } : null;
    }
    case "circlepostcomment": {
      const circleId =
        pickStr(data, "circleId", "destinationCircleId") ?? destCircleId;
      const postId =
        pickStr(data, "secondaryEntityId", "destinationSecondaryEntityId") ??
        destSecondaryId;
      if (!postId) {
        return circleId ? { pathname: "/circleFeed", params: { id: circleId } } : null;
      }
      const params: Record<string, string> = { postId, openComments: "1" };
      if (referenceId !== postId) params.commentId = referenceId;
      if (circleId) params.circleId = circleId;
      return { pathname: "/posts/[id]", params };
    }
    case "anchor": {
      const circleId =
        pickStr(data, "circleId", "destinationCircleId") ??
        pickStr(data, "secondaryEntityId", "destinationSecondaryEntityId") ??
        destSecondaryId;
      return circleId
        ? {
            pathname: "/(tabs)/circle/anchorUnifiedView",
            params: { id: referenceId, circleId, source: "notification" },
          }
        : null;
    }
    case "anchorresponse": {
      // referenceId is the response; secondaryEntityId is its anchor.
      const circleId =
        pickStr(data, "circleId", "destinationCircleId") ?? destCircleId;
      const anchorId =
        pickStr(data, "secondaryEntityId", "destinationSecondaryEntityId") ??
        destSecondaryId;
      if (!circleId) return null;
      return anchorId
        ? {
            pathname: "/(tabs)/circle/anchorUnifiedView",
            params: { id: anchorId, circleId, source: "notification" },
          }
        : { pathname: "/circleFeed", params: { id: circleId } };
    }
    case "contactmessage":
    case "supportticket":
    case "notification":
      return { pathname: "/notifications" };
    default:
      return null;
  }
}

export function resolveNotificationDestination(data?: Record<string, unknown> | null): NotificationHref | null {
  return resolveDestination(data);
}

export function resolveDestinationFromNotification(notification: Record<string, unknown> | undefined | null): NotificationHref | null {
  return resolveDestination(notification);
}

/**
 * Follow/suggestion rows open the actor's profile when the row (avatar /
 * name / message side) is pressed. Returns null for anything else.
 */
export function resolveFollowRowHref(notification: Record<string, unknown> | undefined | null): NotificationHref | null {
  if (!notification) return null;
  const referenceType = notification.referenceType;
  const type = notification.type;
  const isFollowRow =
    referenceType === "follow" || type === "follow" || type === "suggest";
  if (!isFollowRow) return null;
  const user = notification.user as Record<string, unknown> | undefined;
  const userId = user && typeof user.id === "string" ? user.id : undefined;
  if (!userId) return null;
  return { pathname: "/guest", params: { userId } };
}

/** Convert a legacy string path to an Expo Router href */
export function toHref(path: string): NotificationHref | null {
  if (!path || path === "/notifications") return null;

  const qIndex = path.indexOf("?");
  const base = qIndex >= 0 ? path.substring(0, qIndex) : path;
  const queryStr = qIndex >= 0 ? path.substring(qIndex + 1) : "";
  const params: Record<string, string> = {};
  if (queryStr) {
    for (const pair of queryStr.split("&")) {
      const [k, v] = pair.split("=");
      if (k) params[k] = v || "1";
    }
  }

  const viewerMatch = base.match(/^\/viewer\/(.+)$/);
  if (viewerMatch) {
    return { pathname: `/viewer/${viewerMatch[1]}`, params };
  }

  if (base === "/circleFeed") {
    return { pathname: "/circleFeed", params };
  }

  if (base === "/anchor" || base.startsWith("/anchor/") || base === "/circle/anchor") {
    const anchorId = params.anchorId || base.split("/").pop();
    const circleId = params.circleId;
    if (!anchorId || !circleId) return null;
    return {
      pathname: "/(tabs)/circle/anchorUnifiedView",
      params: { id: anchorId, circleId },
    };
  }

  if (base === "/guest") {
    return { pathname: "/guest", params };
  }

  return { pathname: path, params };
}
