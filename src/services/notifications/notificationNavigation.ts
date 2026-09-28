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

  switch (referenceType) {
    case "post":
    case "like":
    case "like_post":
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
    case "circle_post":
    case "anchor": {
      const circleId =
        pickStr(data, "circleId", "destinationCircleId") ??
        pickStr(data, "secondaryEntityId", "destinationSecondaryEntityId") ??
        destSecondaryId;
      return circleId
        ? referenceType === "anchor"
          ? {
              pathname: "/(tabs)/circle/anchorUnifiedView",
              params: { id: referenceId, circleId, source: "notification" },
            }
          : { pathname: "/circleFeed", params: { id: circleId } }
        : null;
    }
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
