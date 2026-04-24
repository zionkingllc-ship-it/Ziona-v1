export function fixMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  if (url.includes(".gstatic.") || url.includes("google.")) {
    const base = url.split("?")[0];
    if (base.includes("/d/")) {
      return base.replace(/\/d\/\d+\//, "/d/0/");
    }
  }

  return url;
}
