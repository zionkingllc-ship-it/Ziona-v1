import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { restRefresh, setTokenExpiry, clearTokenExpiry } from "@/services/auth/refresh";

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

      const newAccessToken = await restRefresh(refreshToken);

      if (newAccessToken) {
        const store = useAuthStore.getState();
        const newRefreshToken = store.tokens?.refreshToken ?? refreshToken;

        setAuthTokens({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      }

      clearAuthTokens();
      useAuthStore.getState().clearSession?.();
    }

    return Promise.reject(
      error.response
        ? { ...error.response.data, _status: error.response.status }
        : error,
    );
  }
);
