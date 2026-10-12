/**
 * Join-circle result reconciliation.
 *
 * The join endpoint is idempotent: tapping Join when already a member
 * (stale UI, second device, retried tap) returns `success: false` with an
 * "already a member"-style error, sometimes without the `circle` payload.
 * That must present as joined — not as "Unable to join".
 */

export type JoinCircleError = {
  code?: string | null;
  message?: string | null;
} | null | undefined;

export type JoinCirclePayload = {
  success?: boolean | null;
  circle?: { isSubscribed?: boolean | null } | null;
  error?: JoinCircleError;
} | null | undefined;

const ALREADY_MEMBER_CODES = new Set([
  "ALREADY_MEMBER",
  "ALREADY_SUBSCRIBED",
  "ALREADY_JOINED",
  "MEMBER_EXISTS",
  "ALREADY_A_MEMBER",
]);

const ALREADY_MEMBER_MESSAGE =
  /already\s+(a\s+)?(member|joined|subscribed)|member\s+exists/i;

/** True when the payload means "you are (already) a member". */
export function isAlreadyCircleMember(payload: JoinCirclePayload): boolean {
  if (!payload || typeof payload !== "object") return false;
  if (payload.circle?.isSubscribed === true) return true;
  const code = payload.error?.code;
  if (typeof code === "string" && ALREADY_MEMBER_CODES.has(code.trim().toUpperCase())) {
    return true;
  }
  const message = payload.error?.message;
  if (typeof message === "string" && ALREADY_MEMBER_MESSAGE.test(message)) {
    return true;
  }
  return false;
}

/** True when the join flow should show the error state. */
export function shouldShowJoinError(payload: JoinCirclePayload): boolean {
  if (!payload || typeof payload !== "object") return false;
  return payload.success === false && !isAlreadyCircleMember(payload);
}
