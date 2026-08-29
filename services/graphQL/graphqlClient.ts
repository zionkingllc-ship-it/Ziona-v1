import { refreshTokenProactively, refreshWithRetry } from "@/services/auth/refresh";
import { AppError, isAuthError, getErrorMessage } from "@/utils/error";

const GRAPHQL_URL = process.env.EXPO_PUBLIC_GRAPHQL_URL || "https://ziona-api-staging.onrender.com/graphql/";

let _getAuthStore: any = null;
function getAuthStore(): any {
  if (!_getAuthStore) {
    _getAuthStore = require("@/store/useAuthStore").useAuthStore;
  }
  return _getAuthStore;
}

export async function graphqlRequest(
  query: string,
  variables?: any,
  retries = 1
) {
  const store = getAuthStore().getState();

  // Proactive refresh before making the request
  let token = store.tokens?.accessToken;
  if (token) {
    const ok = await refreshTokenProactively();
    if (!ok) {
      token = undefined;
    } else {
      const updated = getAuthStore().getState();
      token = updated.tokens?.accessToken;
    }
  }

  const makeRequest = async (accessToken?: string) => {
    return fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : {}),
      },
      body: JSON.stringify({
        query: String(query),
        variables: variables ?? {},
      }),
    });
  };

  let res = await makeRequest(token);
  let json: any = await res.json();

  const hasAuthError =
    res.status === 401 ||
    json?.errors?.some(
      (err: any) => err?.extensions?.code === "UNAUTHENTICATED" ||
                    err?.extensions?.code === "FORBIDDEN" ||
                    isAuthError(err?.message)
    );

  if (hasAuthError) {
    const newAccessToken = await refreshWithRetry(3);

    if (newAccessToken) {
      res = await makeRequest(newAccessToken);
      json = await res.json();

      const stillHasAuthError = res.status === 401 ||
        json?.errors?.some(
          (err: any) => err?.extensions?.code === "UNAUTHENTICATED" ||
                        err?.extensions?.code === "FORBIDDEN" ||
                        isAuthError(err?.message)
        );

      if (stillHasAuthError) {
        await getAuthStore().getState().clearSession?.();
        throw new AppError("Session expired", { code: "SESSION_EXPIRED" });
      }
    } else {
      await getAuthStore().getState().clearSession?.();
      return null;
    }
  }

  if (json?.errors?.length) {
    const errorMessage = json.errors[0]?.message || "Request failed";
    console.error("🔍 [graphql] Request errors:", JSON.stringify(json.errors));
    throw new AppError(errorMessage);
  }

  return json?.data;
}
