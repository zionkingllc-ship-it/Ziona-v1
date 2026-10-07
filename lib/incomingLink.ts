// Normalize public share URLs before Expo Router resolves either cold or warm links.
export function normalizeIncomingLink(path: string): string {
  try {
    let route = path;
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(path)) {
      const url = new URL(path);
      if (url.protocol === "https:" || url.protocol === "http:") {
        if (!["ziona.app", "api.ziona.app", "staging.ziona.app", "api.staging.ziona.app"].includes(url.hostname)) return path;
        route = url.pathname;
      } else if (["ziona:", "zionastaging:"].includes(url.protocol)) {
        route = "/" + url.hostname + url.pathname;
      } else return path;
    }
    const match = route.match(/^\/(post|viewer|profile)\/([^/?#]+)\/?(?:[?#].*)?$/);
    if (!match) return path;
    const id = decodeURIComponent(match[2]);
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) return path;
    return match[1] === "profile" ? "/guest?userId=" + encodeURIComponent(id) : "/viewer/" + encodeURIComponent(id);
  } catch { return path; }
}
