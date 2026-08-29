import axios from "axios";
import { refreshWithRetry, setTokenExpiry, clearTokenExpiry } from "@/services/auth/refresh";
import { AppError } from "@/utils/error";

let _getAuthStore: (() => any) | null = null;
function getAuthStore() {
  if (!_getAuthStore) {
    _getAuthStore = require("@/store/useAuthStore").useAuthStore;
  }
  return _getAuthStore;
}

let accessToken: string | null = null;
let refreshToken: string | null = null;

export const setAuthTokens = (tokens: {
  accessToken: string | null;
  refreshToken: string | null;
}) => {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;
  if (accessToken) setTokenExpiry(accessToken);
};

export const clearAuthTokens = () => {
  accessToken = null;
  refreshToken = null;
  clearTokenExpiry();
};

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || "https://ziona-api-staging.onrender.com";

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 60000,
});

/* REQUEST */

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

/* RESPONSE */

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      refreshToken
    ) {
      originalRequest._retry = true;

      // Use refreshWithRetry (has mutex) instead of raw restRefresh to prevent
      // concurrent refresh calls from collapsing each other.
      const newAccessToken = await refreshWithRetry(1);

      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      }

      clearAuthTokens();
      getAuthStore().getState().clearSession?.();
    }

    return Promise.reject(
      error.response
        ? new AppError(error.response.data?.message || "Request failed", {
            status: error.response.status,
          })
        : new AppError(error.message || "Network error", { retryable: true }),
    );
  }
);
