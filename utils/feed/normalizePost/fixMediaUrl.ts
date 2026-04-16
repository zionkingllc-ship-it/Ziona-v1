export function fixMediaUrl(url?: string): string | undefined {
  if (!url) {
    console.log("[fixMediaUrl] ❌ No URL provided");
    return undefined;
  }

  const base = "https://storage.googleapis.com/";
  const parts = url.split(base);

  if (parts.length > 2) {
    const fixed = base + parts.pop();
    console.log("[fixMediaUrl] ✅ Fixed duplicate base:", fixed);
    return fixed;
  }

  console.log("[fixMediaUrl] ✅ URL OK:", url);
  return url;
}