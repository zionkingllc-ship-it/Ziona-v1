import { useAuthStore } from "@/store/useAuthStore";
import { refreshTokenProactively, refreshWithRetry } from "@/services/auth/refresh";

const GRAPHQL_URL = process.env.EXPO_PUBLIC_GRAPHQL_URL || "https://ziona-api-staging.onrender.com/graphql/";

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

export async function graphqlRequest(
  query: string,
  variables?: any,
  retries = 1
) {
  const store = useAuthStore.getState();

  // Proactive refresh before making the request
  let token = store.tokens?.accessToken;
  if (token) {
    const ok = await refreshTokenProactively();
    if (!ok) {
      token = undefined;
    } else {
      const updated = useAuthStore.getState();
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
  let json = await res.json();

  const isAuthError =
    res.status === 401 ||
    json?.errors?.some(
      (err: any) => err?.extensions?.code === "UNAUTHENTICATED" ||
                    err?.extensions?.code === "FORBIDDEN" ||
                    isAuthErrorMessage(err?.message)
    );

  if (isAuthError) {
    const newAccessToken = await refreshWithRetry(3);

    if (newAccessToken) {
      res = await makeRequest(newAccessToken);
      json = await res.json();

      const stillHasAuthError = res.status === 401 ||
        json?.errors?.some(
          (err: any) => err?.extensions?.code === "UNAUTHENTICATED" ||
                        err?.extensions?.code === "FORBIDDEN" ||
                        isAuthErrorMessage(err?.message)
        );

      if (stillHasAuthError) {
        await useAuthStore.getState().clearSession?.();
        throw new Error("Session expired");
      }
    } else {
      await useAuthStore.getState().clearSession?.();
      return null;
    }
  }

  if (json?.errors?.length) {
    const errorMessage = json.errors[0]?.message || "Request failed";
    console.error("🔍 [graphql] Request errors:", JSON.stringify(json.errors));
    throw new Error(errorMessage);
  }

  return json?.data;
}
