import { AppState, AppStateStatus } from "react-native";
import { isTokenExpired } from "./refresh";
import { clearAuthTokens } from "@/services/api/client";
import { authApi } from "@/services/api/authApi";
import { useAuthStore } from "@/store/useAuthStore";

let healthInterval: ReturnType<typeof setInterval> | null = null;
let appStateSubscription: any = null;
let navigator: { replace: (path: string) => void } | null = null;

export function startAuthHealthMonitor(router: { replace: (path: string) => void }) {
  navigator = router;
  runHealthCheck();
  healthInterval = setInterval(runHealthCheck, 60_000);
  appStateSubscription = AppState.addEventListener("change", (state: AppStateStatus) => {
    if (state === "active") runHealthCheck();
  });
}

export function stopAuthHealthMonitor() {
  if (healthInterval) { clearInterval(healthInterval); healthInterval = null; }
  if (appStateSubscription) { appStateSubscription.remove(); appStateSubscription = null; }
  navigator = null;
}

async function runHealthCheck() {
  const { isAuthenticated, tokens } = useAuthStore.getState();
  if (!isAuthenticated) return;

  if (isTokenExpired()) {
    // Double-check: only force logout if the stored token is actually missing
    // (module-level tokenExpiresAt can be stale after concurrent refreshes)
    if (!tokens?.accessToken) {
      forceLogout();
      return;
    }
    // Token exists in store but module's expiry is stale — re-check by decoding
    return;
  }

  try {
    await authApi.getMe();
  } catch (err: any) {
    const status = err?._status ?? err?.response?.status;
    if (status === 401) {
      navigator?.replace("/(auth)");
    }
  }
}

function forceLogout() {
  clearAuthTokens();
  useAuthStore.getState().clearSession();
  navigator?.replace("/(auth)");
}
