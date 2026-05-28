import { useAuthStore } from "@/store/useAuthStore";

const GRAPHQL_URL = process.env.EXPO_PUBLIC_GRAPHQL_URL || "https://ziona-api-staging.onrender.com/graphql/";
const REST_BASE = `${process.env.EXPO_PUBLIC_API_BASE_URL || "https://ziona-api-staging.onrender.com"}/api`;

const AUTH_ERROR_MESSAGES = [
  "unauthorized",
  "not authenticated",
  "authentication required",
  "token expired",
  "invalid token",
  "missing token",
  "jwt",
  "bearer",
];

function isAuthErrorMessage(message: string | null | undefined): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return AUTH_ERROR_MESSAGES.some((authMsg) => lower.includes(authMsg));
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function refreshWithRetry(maxRetries = 3): Promise<string | null> {
  const store = useAuthStore.getState();
  const refreshToken = store.tokens?.refreshToken;

  if (!refreshToken) return null;

  let lastError = null;

  // Try REST /auth/refresh first (more reliable endpoint)
  try {
    const restResult = await restRefresh(refreshToken);
    if (restResult) return restResult;
  } catch (err) {
    lastError = err instanceof Error ? err.message : "REST refresh error";
    console.warn("REST refresh failed, falling back to GraphQL:", lastError);
  }

  // Fall back to GraphQL mutation retries
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Add exponential backoff: 500ms, 1000ms, 2000ms
      if (attempt > 0) {
        const delay = 500 * Math.pow(2, attempt - 1);
        console.log(`GraphQL refresh retry ${attempt + 1}/${maxRetries} after ${delay}ms...`);
        await sleep(delay);
      }

      const res = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation RefreshToken($refreshToken: String!) {
              refreshToken(refreshToken: $refreshToken) {
                accessToken
                refreshToken
              }
            }
          `,
          variables: { refreshToken },
        }),
      });

      const json = await res.json();

      // Handle both camelCase and snake_case from the backend
      const rawTokens = json?.data?.refreshToken;
      const newTokens = rawTokens
        ? {
            accessToken: rawTokens.accessToken ?? rawTokens.access_token ?? "",
            refreshToken: rawTokens.refreshToken ?? rawTokens.refresh_token ?? "",
          }
        : null;

      if (newTokens?.accessToken) {
        useAuthStore.getState().setTokens?.(newTokens);
        console.log(`Token refreshed successfully on attempt ${attempt + 1}`);
        return newTokens.accessToken;
      }

      lastError = json?.errors?.[0]?.message || "No tokens in response";
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Network error";
      console.warn(`GraphQL refresh attempt ${attempt + 1} failed:`, lastError);
    }
  }

  console.warn(`All ${maxRetries} GraphQL refresh attempts failed. Last error:`, lastError);
  return null;
}

async function restRefresh(token: string): Promise<string | null> {
  const res = await fetch(`${REST_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: token }),
  });

  if (!res.ok) {
    console.warn(`REST refresh returned ${res.status}`);
    return null;
  }

  const data = await res.json();

  console.log("REST refresh raw response:", JSON.stringify(data).slice(0, 300));

  // Handle wrapped { data: { accessToken, refreshToken } } or flat, and snake_case
  const inner = data?.data ?? data;
  const accessToken = inner.accessToken ?? inner.access_token ?? null;
  const newRefreshToken = inner.refreshToken ?? inner.refresh_token ?? null;

  console.log("REST refresh extracted:", JSON.stringify({ accessToken: accessToken?.slice(0, 20), hasRefreshToken: !!newRefreshToken }));

  if (accessToken) {
    useAuthStore.getState().setTokens?.({
      accessToken,
      refreshToken: newRefreshToken ?? "",
    });
    console.log("Token refreshed successfully via REST endpoint");
    return accessToken;
  }

  console.warn("REST refresh succeeded but no access token in response");
  return null;
}

// Convenience function - refresh on user interaction (option 3)
export async function refreshTokenProactively(): Promise<boolean> {
  const newToken = await refreshWithRetry(2); // 2 attempts for proactive refresh
  return !!newToken;
}

// Alias for backward compatibility
const refreshAccessToken = refreshWithRetry;

export async function graphqlRequest(
  query: string,
  variables?: any,
  retries = 1
) {
  const store = useAuthStore.getState();
  let token = store.tokens?.accessToken;

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

  const queryPreview = query.replace(/\s+/g, " ").substring(0, 120);
  console.log("🔍 [graphql] Making request:", queryPreview);
  let res = await makeRequest(token);
  let json = await res.json();
  console.log("🔍 [graphql] Response status:", res.status, "hasErrors:", !!json?.errors?.length);

  const isAuthError =
    res.status === 401 ||
    json?.errors?.some(
      (err: any) => err?.extensions?.code === "UNAUTHENTICATED" ||
                    err?.extensions?.code === "FORBIDDEN" ||
                    isAuthErrorMessage(err?.message)
    );

  if (isAuthError) {
    console.warn("Token expired — attempting refresh with retry...");

    // Option 2: Retry with backoff (up to 3 times)
    const newAccessToken = await refreshWithRetry(3);

    if (newAccessToken) {
      console.log("Token refreshed — retrying request");

      res = await makeRequest(newAccessToken);
      json = await res.json();

      const stillHasAuthError = res.status === 401 ||
        json?.errors?.some(
          (err: any) => err?.extensions?.code === "UNAUTHENTICATED" ||
                        err?.extensions?.code === "FORBIDDEN" ||
                        isAuthErrorMessage(err?.message)
        );

      if (stillHasAuthError) {
        console.warn("Refresh still failing after retries — clearing session");
        await useAuthStore.getState().clearSession?.();
        throw new Error("Session expired");
      }
    } else {
      console.warn("Refresh failed after 3 attempts — clearing session");
      await useAuthStore.getState().clearSession?.();
      return null;
    }
  }

  if (json?.errors?.length) {
    const errorMessage = json.errors[0]?.message || "Request failed";
    console.error("🔍 [graphql] Request errors:", JSON.stringify(json.errors));
    throw new Error(errorMessage);
  }

  const responseKeys = json?.data ? Object.keys(json.data) : [];
  console.log("🔍 [graphql] Response data keys:", responseKeys);
  return json?.data;
}