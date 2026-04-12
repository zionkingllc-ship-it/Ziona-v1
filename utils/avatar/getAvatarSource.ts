/**
 * Safe avatar source resolver with fallbacks
 * Handles missing, invalid, or empty avatar URLs
 */

export function getAvatarSource(
  avatarUrl?: string | null,
  fallbackUrl?: string,
) {
  // If avatarUrl exists and is not empty, use it
  if (avatarUrl && avatarUrl.trim()) {
    return { uri: avatarUrl };
  }

  // Use fallback URL if provided
  if (fallbackUrl && fallbackUrl.trim()) {
    return { uri: fallbackUrl };
  }

  // Default gravatar fallback
  return { uri: "https://i.pravatar.cc/100?d=mp" };
}

/**
 * Get avatar source with priority for local then backend
 */
export function getAvatarSourceWithLocal(
  localAvatarUrl?: string | null,
  backendAvatarUrl?: string | null,
  fallbackUrl?: string,
) {
  if (localAvatarUrl && localAvatarUrl.trim()) {
    return { uri: localAvatarUrl };
  }

  return getAvatarSource(backendAvatarUrl, fallbackUrl);
}
