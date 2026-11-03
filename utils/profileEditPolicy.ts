const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export type ProfileEditPolicy = {
  createdAt: string;
  lastNameChange: string | null;
  lastUsernameChange: string | null;
  displayNameEditableUntil: string | null;
  usernameEditableUntil: string | null;
  usernameGraceChangesRemaining: number;
};

export function getEditAvailability(policy: ProfileEditPolicy | undefined, now: number) {
  if (!policy) {
    // If status cannot be loaded, let the server validate a submitted change.
    return { inGrace: false, nameLockedUntil: null, usernameLockedUntil: null, graceChangesRemaining: null };
  }
  const createdAt = Date.parse(policy.createdAt);
  const graceEnd = createdAt + 48 * HOUR;
  const inGrace = Number.isFinite(graceEnd) && now < graceEnd;
  const lastName = policy.lastNameChange ? Date.parse(policy.lastNameChange) : NaN;
  const lastUsername = policy.lastUsernameChange ? Date.parse(policy.lastUsernameChange) : NaN;
  const nameDeadline = lastName + 14 * DAY;
  const usernameDeadline = lastUsername + 30 * DAY;
  return {
    inGrace,
    nameLockedUntil: !inGrace && lastName >= graceEnd && nameDeadline > now ? nameDeadline : null,
    usernameLockedUntil: inGrace
      ? policy.usernameGraceChangesRemaining <= 0 ? graceEnd : null
      : lastUsername >= graceEnd && usernameDeadline > now ? usernameDeadline : null,
    graceChangesRemaining: inGrace ? policy.usernameGraceChangesRemaining : null,
  };
}

export function formatEditDate(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(timestamp));
}
