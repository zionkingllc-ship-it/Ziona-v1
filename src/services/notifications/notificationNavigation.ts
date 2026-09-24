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
): NotificationHref | null {
  if (route.startsWith("/post/") || route.startsWith("/posts/")) {
    const id =
      entityId ||
      route.replace(/^\/posts?\//, "").split(/[/?&]/)[0] ||
      undefined;
    if (!id) return null;
    const params: Record<string, string> = { postId: id };
    if (isComment) params.openComments = "1";
    return { pathname: `/viewer/${id}`, params };
  }

  if (VIEWER_ROUTES.some((r) => route.startsWith(r))) {
    const id =
      (isComment ? secondaryEntityId : undefined) ||
      entityId ||
      route.replace(/^\/viewer\/?/, "").split("?")[0] ||
      undefined;
    if (!id) return null;
    const params: Record<string, string> = { postId: id };
    if (isComment) params.openComments = "1";
    return { pathname: `/viewer/${id}`, params };
  }

  if (CIRCLE_FEED_ROUTES.some((r) => route.startsWith(r))) {
    const routeId = route.replace(/^\/circleFeed\?id=?/, "").split("&")[0] || undefined;
    const id =
      routeId ||
      (entityType === "anchor" || entityType === "circle_post"
        ? secondaryEntityId
        : entityId);
    if (!id) return null;
    return { pathname: "/circleFeed", params: { id } };
  }

  if (route.toLowerCase().includes("anchor")) {
    const circleId = secondaryEntityId;
    if (!circleId) return null;
    if (!entityId) return { pathname: "/circleFeed", params: { id: circleId } };
    return {
      pathname: "/(tabs)/circle/anchorUnifiedView",
      params: { id: entityId || "", circleId, source: "notification" },
    };
  }

  if (GUEST_ROUTES.some((r) => route.startsWith(r))) {
    const id = entityId || route.replace(/^\/guest\?userId=?/, "").split("&")[0] || undefined;
    if (!id) return null;
    return { pathname: "/guest", params: { userId: id } };
  }

  return null;
}

function resolveDestination(data?: Record<string, unknown> | null): NotificationHref | null {
  if (!data) return null;

  // 1. Top-level route/entityId (from push notification payload)
  const entityId = typeof data.entityId === "string" ? data.entityId : undefined;

  if (data.route && entityId) {
    const isComment =
      data.entityType === "comment" || data.referenceType === "comment";
    const href = toHrefFromParts(
      data.route as string,
      entityId,
      isComment,
      typeof data.secondaryEntityId === "string" ? data.secondaryEntityId : undefined,
      typeof data.entityType === "string" ? data.entityType : undefined,
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
    if (destRoute) {
      const isComment =
        dest.entityType === "comment" || data.referenceType === "comment";
      const href = toHrefFromParts(
        destRoute,
        destEntityId,
        isComment,
        destSecondaryEntityId,
        typeof dest.entityType === "string" ? dest.entityType : undefined,
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

  const isComment = referenceType === "comment";

  switch (referenceType) {
    case "post":
    case "like":
    case "like_post":
    case "mention":
    case "comment": {
      const params: Record<string, string> = { postId: referenceId };
      if (isComment) params.openComments = "1";
      return { pathname: `/viewer/${referenceId}`, params };
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
        typeof data.secondaryEntityId === "string" ? data.secondaryEntityId : undefined;
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
