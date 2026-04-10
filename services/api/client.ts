import axios from "axios";

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

        const newTokens = response.data;

        setAuthTokens({
          accessToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken,
        });

        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;

        return api(originalRequest);
      } catch {
        clearAuthTokens();
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);