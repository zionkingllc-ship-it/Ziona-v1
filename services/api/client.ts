import axios, { InternalAxiosRequestConfig } from "axios";
import type { useAuthStore } from "@/store/useAuthStore";
import { refreshWithRetry, setTokenExpiry, clearTokenExpiry } from "@/services/auth/refresh";
import { getSessionVersion } from "@/services/auth/session";
import { AppError } from "@/utils/error";

function getAuthStore(): typeof useAuthStore {
  return require("@/store/useAuthStore").useAuthStore;
}

let accessToken: string | null = null;
export const setAuthTokens = (tokens: { accessToken: string | null; refreshToken: string | null }) => {
  accessToken = tokens.accessToken;
  if (accessToken) setTokenExpiry(accessToken);
  else clearTokenExpiry();
};
export const clearAuthTokens = () => {
  accessToken = null;
  clearTokenExpiry();
};

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || "https://ziona-api-staging.onrender.com";
export const api = axios.create({ baseURL: `${API_BASE}/api`, timeout: 60000 });
type SessionRequest = InternalAxiosRequestConfig & { _retry?: boolean; _sessionVersion?: number };

api.interceptors.request.use((config: SessionRequest) => {
  config._sessionVersion = getSessionVersion();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => {
    const config = response.config as SessionRequest;
    if (config._sessionVersion !== getSessionVersion()) throw new AppError("Session changed", { code: "SESSION_CHANGED", retryable: false });
    return response;
  },
  async (error) => {
    const originalRequest = error.config as SessionRequest | undefined;
    const version = originalRequest?._sessionVersion;
    if (version !== undefined && version !== getSessionVersion()) throw new AppError("Session changed", { code: "SESSION_CHANGED", retryable: false });

    if (error.response?.status === 401 && originalRequest?.headers.Authorization) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        // Transient failures throw and preserve the session; null means rejected credentials.
        const newToken = await refreshWithRetry(1);
        if (version !== getSessionVersion()) throw new AppError("Session changed", { code: "SESSION_CHANGED", retryable: false });
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      }
      await getAuthStore().getState().clearSession();
    }
    throw error.response
      ? new AppError(error.response.data?.message || "Request failed", { status: error.response.status })
      : new AppError(error.message || "Network error", { retryable: true });
  },
);
