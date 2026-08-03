let _getAuthStore: (() => any) | null = null;
function getAuthStore() {
  if (!_getAuthStore) {
    _getAuthStore = require("@/store/useAuthStore").useAuthStore;
  }
  return _getAuthStore;
}

const REST_BASE = `${process.env.EXPO_PUBLIC_API_BASE_URL || "https://ziona-api-staging.onrender.com"}/api`;

/* =========================
   JWT EXPIRY
========================= */

let tokenExpiresAt: number | null = null;

function decodeExp(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function setTokenExpiry(accessToken: string) {
  tokenExpiresAt = decodeExp(accessToken);
}

export function clearTokenExpiry() {
  tokenExpiresAt = null;
}

export function isTokenExpired(): boolean {
  if (!tokenExpiresAt) return false;
  return Date.now() >= tokenExpiresAt;
}

/* =========================
   REFRESH MUTEX
========================= */

let refreshInProgress: Promise<string | null> | null = null;

/* =========================
   REST REFRESH
========================= */

export async function restRefresh(refreshToken: string): Promise<string | null> {
  const res = await fetch(`${REST_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();

  const inner = data?.data ?? data;
  const accessToken = inner.accessToken ?? inner.access_token ?? null;
  const newRefreshToken = inner.refreshToken ?? inner.refresh_token ?? null;

  if (accessToken) {
    setTokenExpiry(accessToken);
    getAuthStore().getState().setTokens?.({
      accessToken,
      refreshToken: newRefreshToken ?? "",
    });
    return accessToken;
  }

  return null;
}

/* =========================
   REFRESH WITH RETRY + MUTEX
========================= */

export async function refreshWithRetry(maxRetries = 3): Promise<string | null> {
  const store = getAuthStore().getState();
  const refreshToken = store.tokens?.refreshToken;

  if (!refreshToken) return null;

  // Deduplicate concurrent refresh calls
  if (refreshInProgress) {
    return refreshInProgress;
  }

  refreshInProgress = (async () => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt - 1)));
        }
        const result = await restRefresh(refreshToken);
        if (result) return result;
      } catch (err) {
        console.warn(`Refresh attempt ${attempt + 1}/${maxRetries} failed:`, err);
      }
    }
    return null;
  })();

  try {
    return await refreshInProgress;
  } finally {
    refreshInProgress = null;
  }
}

/* =========================
   PROACTIVE REFRESH
========================= */

export async function refreshTokenProactively(): Promise<boolean> {
  const store = getAuthStore().getState();
  const token = store.tokens?.accessToken;
  if (!token) return false;

  // If token expires within 30s, refresh now
  const expiry = decodeExp(token);
  if (expiry && expiry - Date.now() < 30000) {
    const newToken = await refreshWithRetry(1);
    return !!newToken;
  }

  return true;
}

/* =========================
   EXTRACT TOKENS (shared)
========================= */

export function extractTokens(data: any): {
  accessToken: string | null;
  refreshToken: string | null;
} {
  const inner = data?.data ?? data;
  return {
    accessToken: inner.accessToken ?? inner.access_token ?? null,
    refreshToken: inner.refreshToken ?? inner.refresh_token ?? null,
  };
}
