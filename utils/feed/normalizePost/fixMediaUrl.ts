export function fixMediaUrl(url?: string): string | undefined {
  if (!url) return undefined;

  const base = "https://storage.googleapis.com/";
  const parts = url.split(base);

  if (parts.length > 2) {
    return base + parts.pop();
  }

  return url;
}