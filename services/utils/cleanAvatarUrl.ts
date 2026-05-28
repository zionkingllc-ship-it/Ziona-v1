const STORAGE_BASE = process.env.EXPO_PUBLIC_STORAGE_BASE_URL || "https://storage.googleapis.com";

export function extractPublicUrl(uploadUrl: string) {
  const url = new URL(uploadUrl);
  let path = url.pathname;
  if (path.startsWith("/")) path = path.slice(1);
  return `${STORAGE_BASE}/${path}`;
}

export function cleanAvatarUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  try {
    const parsedUrl = new URL(url);
    const cleanUrl = `${parsedUrl.origin}${parsedUrl.pathname}`;
    return cleanUrl;
  } catch {
    return url;
  }
}
