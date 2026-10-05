import type { useAuthStore } from "@/store/useAuthStore";
import { AppError } from "@/utils/error";
import { getSessionVersion } from "./session";

function getAuthStore(): typeof useAuthStore {
  return require("@/store/useAuthStore").useAuthStore;
}

const REST_BASE = `${process.env.EXPO_PUBLIC_API_BASE_URL || "https://ziona-api-staging.onrender.com"}/api`;
let tokenExpiresAt: number | null = null;

function decodeExp(token: string): number | null {
  try {
    const encoded = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, "=")));
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
  return tokenExpiresAt !== null && Date.now() >= tokenExpiresAt;
}

let refreshInProgress: { version: number; promise: Promise<string | null> } | null = null;

function assertSession(version: number) {
  if (getSessionVersion() !== version) {
    throw new AppError("Session changed", { code: "SESSION_CHANGED", retryable: false });
  }
}

export async function restRefresh(refreshToken: string): Promise<string | null> {
  const version = getSessionVersion();
  const res = await fetch(`${REST_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  assertSession(version);

  // Only a rejected credential is evidence that the session has expired.
  if (res.status === 401 || res.status === 403) return null;
  if (!res.ok) {
    throw new AppError("Unable to refresh session", { status: res.status, retryable: true });
  }

  const data = await res.json();
  assertSession(version);
  const { accessToken, refreshToken: rotatedToken } = extractTokens(data);
  if (!accessToken) {
    throw new AppError("Invalid token refresh response", { retryable: true });
  }
  getAuthStore().getState().setTokens({ accessToken, refreshToken: rotatedToken || refreshToken });
  return accessToken;
}

export async function refreshWithRetry(maxRetries = 3): Promise<string | null> {
  const version = getSessionVersion();
  const refreshToken = getAuthStore().getState().tokens?.refreshToken;
  if (!refreshToken) return null;
  if (refreshInProgress?.version === version) return refreshInProgress.promise;

  const pending = {
    version,
    promise: (async () => {
      let lastError: unknown;
      for (let attempt = 0; attempt < Math.max(1, maxRetries); attempt++) {
        if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** (attempt - 1)));
        assertSession(version);
        try {
          return await restRefresh(refreshToken);
        } catch (error) {
          assertSession(version);
          lastError = error;
        }
      }
      throw lastError instanceof AppError ? lastError : new AppError("Unable to connect. Please try again.", { retryable: true });
    })(),
  };
  refreshInProgress = pending;
  try {
    return await pending.promise;
  } finally {
    if (refreshInProgress === pending) refreshInProgress = null;
  }
}

export async function refreshTokenProactively(): Promise<boolean> {
  const token = getAuthStore().getState().tokens?.accessToken;
  if (!token) return false;
  const expiry = decodeExp(token);
  if (expiry && expiry - Date.now() < 30000) return !!(await refreshWithRetry(1));
  return true;
}

export function extractTokens(data: any): { accessToken: string | null; refreshToken: string | null } {
  const inner = data?.data ?? data ?? {};
  return {
    accessToken: inner.accessToken ?? inner.access_token ?? inner.tokens?.accessToken ?? inner.tokens?.access_token ?? null,
    refreshToken: inner.refreshToken ?? inner.refresh_token ?? inner.tokens?.refreshToken ?? inner.tokens?.refresh_token ?? null,
  };
}
