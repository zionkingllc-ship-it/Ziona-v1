function resolveDestination(data?: Record<string, unknown> | null): string {
  if (!data) return "/notifications";

  const entityId = typeof data.entityId === "string" ? data.entityId : undefined;

  if (data.route && entityId) {
    const isComment =
      data.entityType === "comment" || data.referenceType === "comment";
    const openComments = isComment ? "?openComments=1" : "";
    return `${data.route}${entityId}${openComments}`;
  }

  const referenceType =
    typeof data.referenceType === "string" ? data.referenceType : undefined;
  const referenceId =
    typeof data.referenceId === "string" || typeof data.referenceId === "number"
      ? String(data.referenceId)
      : undefined;

  if (!referenceType || !referenceId) return "/notifications";

  const REFERENCE_TYPE_TO_ROUTE: Record<string, string> = {
    post: "/viewer/",
    like: "/viewer/",
    like_post: "/viewer/",
    mention: "/viewer/",
    comment: "/viewer/",
    user: "/guest?userId=",
    follow: "/guest?userId=",
    profile: "/guest?userId=",
    circle: "/circleFeed?id=",
    circle_post: "/circleFeed?id=",
  };

  const base = REFERENCE_TYPE_TO_ROUTE[referenceType];
  if (!base) return "/notifications";

  if (referenceType === "comment") {
    return `${base}${referenceId}?openComments=1`;
  }

  return `${base}${referenceId}`;
}

export function resolveNotificationDestination(data?: Record<string, unknown> | null): string {
  return resolveDestination(data);
}

export function resolveDestinationFromNotification(notification: Record<string, unknown> | undefined | null): string {
  return resolveDestination(notification);
}