import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

let accessToken: string | null = null;
let refreshToken: string | null = null;

export const setAuthTokens = (tokens: {
  accessToken: string | null;
  refreshToken: string | null;
}) => {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;
};

export const clearAuthTokens = () => {
  accessToken = null;
  refreshToken = null;
};

export const api = axios.create({
  baseURL: "https://ziona-api-staging.onrender.com/api",
  timeout: 60000,
});

/* HELPERS */

function extractTokens(data: any) {
  // Backend may wrap in { data: { accessToken, refreshToken } }
  // or use snake_case: { access_token, refresh_token }
  const inner = data?.data ?? data;
  return {
    accessToken: inner.accessToken ?? inner.access_token ?? null,
    refreshToken: inner.refreshToken ?? inner.refresh_token ?? null,
  };
}

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

      try {
        const response = await axios.post(
          "https://ziona-api-staging.onrender.com/api/auth/refresh",
          {
            refresh_token: refreshToken,
          }
        );

        const newTokens = extractTokens(response.data);

        if (!newTokens.accessToken) {
          throw new Error("No access token in refresh response");
        }

        setAuthTokens({
          accessToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken,
        });

        // Persist to Zustand store so it survives app relaunch
        useAuthStore.getState().setTokens?.(newTokens as any);

        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;

        return api(originalRequest);
      } catch {
        clearAuthTokens();
        useAuthStore.getState().clearSession?.();
      }
    }

    return Promise.reject(
      error.response
        ? { ...error.response.data, _status: error.response.status }
        : error,
    );
  }
);