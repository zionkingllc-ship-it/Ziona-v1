import { queryClient } from "@/lib/queryClient";
import { authApi } from "@/services/api/authApi";
import { clearAuthTokens, setAuthTokens } from "@/services/api/client";
import { advanceSession, getSessionVersion } from "@/services/auth/session";
import { AuthState, AuthTokens, User } from "@/types";
import { isAuthError } from "@/utils/error";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

function clearAuthQueries() {
  void queryClient.cancelQueries();
  queryClient.clear();
}

type AuthStore = AuthState & {
  isBootstrapping: boolean;
  isInitializing: boolean;
  _hasHydrated: boolean;
  setAuth: (user: User, tokens: AuthTokens) => void;
  setTokens: (tokens: AuthTokens) => void;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  setHasHydrated: (state: boolean) => void;
  clearSession: () => Promise<void>;
  onLogoutNavigate?: () => void;
  _forceLogout?: number;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      mode: "unauthenticated",
      _hasHydrated: false,
      isBootstrapping: true,
      isInitializing: false,
      onLogoutNavigate: undefined,

      setAuth: (user, tokens) => {
        advanceSession();
        clearAuthQueries();
        setAuthTokens(tokens);
        set({ user, tokens, isAuthenticated: true, mode: "authenticated", isBootstrapping: false, isInitializing: false, _forceLogout: undefined });
      },

      setTokens: (tokens) => {
        setAuthTokens(tokens);
        set({ tokens });
      },

      clearSession: async () => {
        advanceSession();
        clearAuthTokens();
        clearAuthQueries();
        // Persist the cleared state. A delayed removeItem could delete a newer login.
        set({ user: null, tokens: null, isAuthenticated: false, mode: "unauthenticated", isBootstrapping: false, isInitializing: false, _forceLogout: undefined });
      },

      logout: async () => {
        const accessToken = get().tokens?.accessToken;
        await get().clearSession();
        get().onLogoutNavigate?.();
        // Revocation uses captured credentials and cannot refresh or clear a new session.
        if (accessToken) await authApi.signOut(accessToken);
      },

      initializeAuth: async () => {
        const state = get();
        if (!state._hasHydrated || state.isInitializing) return;
        const version = getSessionVersion();
        const tokens = state.tokens;
        if (!tokens?.accessToken) {
          set({ isBootstrapping: false, isInitializing: false });
          return;
        }

        setAuthTokens(tokens);
        set({ isInitializing: true, isBootstrapping: false });
        try {
          for (let attempt = 0; attempt < 3; attempt++) {
            if (getSessionVersion() !== version) return;
            try {
              const user = await authApi.getMe();
              if (getSessionVersion() !== version) return;
              if (user?.id) {
                set({ user, isAuthenticated: true, mode: "authenticated" });
                // The profile hook owns its GraphQL cache and normalization.
                return;
              }
            } catch (error) {
              if (getSessionVersion() !== version) return;
              if (isAuthError(error)) {
                await get().clearSession();
                return;
              }
            }
            if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 2000));
          }
          // Connectivity failures do not revoke the user's stored session.
        } finally {
          if (getSessionVersion() === version) set({ isInitializing: false });
        }
      },

      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, tokens: state.tokens, isAuthenticated: state.isAuthenticated, mode: state.mode }),
      // A login/logout that happened during the asynchronous read takes precedence.
      merge: (persisted, current) => getSessionVersion() > 0 ? current : { ...current, ...(persisted as Partial<AuthStore>) },
      onRehydrateStorage: () => (state) => {
        if (!state) {
          queueMicrotask(() => useAuthStore.getState().setHasHydrated(true));
          return;
        }
        // Migrate the old interrupted-logout marker without trapping the splash screen.
        if (state._forceLogout && Date.now() - state._forceLogout < 30_000) {
          state.user = null;
          state.tokens = null;
          state.isAuthenticated = false;
          state.mode = "unauthenticated";
        }
        state._forceLogout = undefined;
        if (state.user && "data" in state.user) state.user = (state.user as { data: User }).data;
        if (state.tokens?.accessToken) setAuthTokens(state.tokens);
        else clearAuthTokens();
        state.setHasHydrated(true);
      },
    },
  ),
);
