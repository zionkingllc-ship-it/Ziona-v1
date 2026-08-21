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
}

export function resolveNotificationDestination(data?: Record<string, unknown> | null): string {
  if (!data) return "/notifications"
  const referenceType =
    typeof data.referenceType === "string" ? data.referenceType : undefined
  const referenceId =
    typeof data.referenceId === "string" || typeof data.referenceId === "number"
      ? String(data.referenceId)
      : undefined

  if (!referenceType || !referenceId) return "/notifications"

  const base = REFERENCE_TYPE_TO_ROUTE[referenceType]
  if (!base) return "/notifications"

  if (referenceType === "comment") {
    return `${base}${referenceId}?openComments=1`
  }

  return `${base}${referenceId}`
}