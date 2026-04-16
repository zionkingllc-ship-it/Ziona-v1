export function extractPublicUrl(uploadUrl: string) {
  const url = new URL(uploadUrl);
  let path = url.pathname;
  if (path.startsWith("/")) path = path.slice(1);
  return `https://storage.googleapis.com/${path}`;
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
