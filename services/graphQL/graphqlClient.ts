import type { useAuthStore } from "@/store/useAuthStore";
import { refreshTokenProactively, refreshWithRetry } from "@/services/auth/refresh";
import { getSessionVersion } from "@/services/auth/session";
import { AppError, isAuthError } from "@/utils/error";

const GRAPHQL_URL = process.env.EXPO_PUBLIC_GRAPHQL_URL || "https://ziona-api-staging.onrender.com/graphql/";

function getAuthStore(): typeof useAuthStore {
  return require("@/store/useAuthStore").useAuthStore;
}

type GraphQLError = { message?: string; extensions?: { code?: string } };

function isAuthenticationFailure(status: number, errors?: GraphQLError[]) {
  if (status === 401) return true;
  return errors?.some((error) => {
    const code = error.extensions?.code;
    if (code === "FORBIDDEN") return false;
    return code === "UNAUTHENTICATED" || isAuthError(error.message);
  }) ?? false;
}

export async function graphqlRequest(query: string, variables?: any, retries = 1) {
  const version = getSessionVersion();
  const assertSession = () => {
    if (getSessionVersion() !== version) {
      throw new AppError("Session changed", { code: "SESSION_CHANGED", retryable: false });
    }
  };
  const expireSession = async () => {
    assertSession();
    await getAuthStore().getState().clearSession();
    throw new AppError("Session expired", { code: "SESSION_EXPIRED", status: 401, retryable: false });
  };

  let token = getAuthStore().getState().tokens?.accessToken;
  if (token) {
    const refreshed = await refreshTokenProactively();
    assertSession();
    if (!refreshed) return expireSession();
    token = getAuthStore().getState().tokens?.accessToken;
  }

  const makeRequest = async (accessToken?: string) => {
    const response = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ query: String(query), variables: variables ?? {} }),
    });
    assertSession();
    // Authentication failures may have an empty/non-JSON response body.
    const json = await response.json().catch(() => null);
    assertSession();
    return { response, json };
  };

  let { response, json } = await makeRequest(token);
  if (isAuthenticationFailure(response.status, json?.errors)) {
    if (!token) throw new AppError("Sign in to continue", { code: "UNAUTHENTICATED", status: 401, retryable: false });
    const newToken = await refreshWithRetry(Math.max(1, retries));
    assertSession();
    if (!newToken) return expireSession();
    ({ response, json } = await makeRequest(newToken));
    if (isAuthenticationFailure(response.status, json?.errors)) return expireSession();
  }

  if (json?.errors?.length) {
    const error: GraphQLError = json.errors[0];
    throw new AppError(error.message || "Request failed", { code: error.extensions?.code, status: response.status });
  }
  if (!response.ok || !json || !("data" in json)) {
    throw new AppError("Request failed", { status: response.status, retryable: response.status >= 500 });
  }
  return json.data;
}
