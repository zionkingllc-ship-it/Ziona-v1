import { useAuthStore } from "@/store/useAuthStore";

const GRAPHQL_URL = "https://ziona-api-staging.onrender.com/graphql/";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function refreshAccessToken() {
  const store = useAuthStore.getState();
  const refreshToken = store.tokens?.refreshToken;

  if (!refreshToken) return null;

  try {
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

    const newTokens = json?.data?.refreshToken;

    if (newTokens?.accessToken) {
      useAuthStore.getState().setTokens?.(newTokens);
      return newTokens.accessToken;
    }

    return null;
  } catch {
    return null;
  }
}

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

  console.log("GRAPHQL REQUEST BODY:", {
  query,
  variables,
});



  let res = await makeRequest(token);
  let json = await res.json();
 
  const isAuthError =
    json?.errors?.some((err: any) =>
      String(err.message).toLowerCase().includes("auth")
    ) || res.status === 401;

  if (isAuthError) {
    console.warn("Token expired — attempting refresh");

    const newAccessToken = await refreshAccessToken();

    if (newAccessToken) {
      console.log("Token refreshed — retrying request");

      res = await makeRequest(newAccessToken);
      json = await res.json();
    } else {
      console.warn("Refresh failed — logging out");
      useAuthStore.getState().logout?.();
      throw new Error("Session expired");
    }
  }

  console.log("GRAPHQL RESPONSE FULL:", json);
  return json?.data;
}