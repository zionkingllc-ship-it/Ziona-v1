import { GET_USER_POSTS } from "@/hooks/useUserPost";
import { queryClient } from "@/lib/queryClient";
import { authApi } from "@/services/api/authApi";
import { clearAuthTokens, setAuthTokens } from "@/services/api/client";
import { graphqlRequest, refreshWithRetry } from "@/services/graphQL/graphqlClient";
import { AuthState, AuthTokens, User } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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

      /* -------- LOGIN SUCCESS -------- */

      setAuth: (user, tokens) => {
        setAuthTokens({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        });

        set({
          user,
          tokens,
          isAuthenticated: true,
          mode: "authenticated",
        });

        queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      },

      /* -------- TOKEN UPDATE -------- */

      setTokens: (tokens) => {
        setAuthTokens({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        });

        set({ tokens });
      },

      /* -------- LOGOUT -------- */

      clearSession: async () => {
        clearAuthTokens();

        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          mode: "unauthenticated",
        });

        await AsyncStorage.removeItem("auth-storage");
        queryClient.clear();
      },

      logout: async () => {
        // Mark logout time for conflict resolution during rehydration
        const logoutTime = Date.now();

        // Clear store IMMEDIATELY - don't wait for signOut
        clearAuthTokens();
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          mode: "unauthenticated",
          _hasHydrated: false,
          _forceLogout: logoutTime,
        });
        queryClient.clear();

        // Try signOut but don't block - it's ok if it fails
        try {
          await authApi.signOut();
        } catch {
          // Ignore signOut failures - we cleared the store anyway
        }

        // Clean up persisted storage
        await AsyncStorage.removeItem("auth-storage");

        // Navigate to login
        get().onLogoutNavigate?.();
      },

      /* -------- INIT AUTH -------- */

      initializeAuth: async () => {
        const state = get();

        if (state.isInitializing) return;

        set({ isInitializing: true });

        const tokens = state.tokens;

        //  set tokens IMMEDIATELY
        if (tokens?.accessToken) {
          setAuthTokens({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          });
        }

        if (!tokens?.accessToken) {
          set({
            isBootstrapping: false,
            isInitializing: false,
          });
          return;
        }

        // Store user in memory immediately (even if getMe fails)
        const storedUser = state.user;
        if (storedUser?.id) {
          set({
            user: storedUser,
            isAuthenticated: true,
            mode: "authenticated",
          });
        }

        const bootstrap = async () => {
          // Silently retry getMe with token refresh
          const maxAttempts = 5;
          let lastError: any = null;

          for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
              // Refresh token first if needed
              if (attempt > 0) {
                const newToken = await refreshWithRetry(2);
                if (!newToken) {
                  // Refresh failed, wait and retry
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  continue;
                }
              }

              const user = await authApi.getMe();

              if (user?.id) {
                set({
                  user,
                  isAuthenticated: true,
                  mode: "authenticated",
                });

                await Promise.all([
                  queryClient.prefetchQuery({
                    queryKey: ["userProfile", user.id],
                    queryFn: () => authApi.getMe(),
                  }),
                  queryClient.prefetchInfiniteQuery({
                    queryKey: ["userPosts", user.id],
                    queryFn: async ({ pageParam }) => {
                      const data = await graphqlRequest(GET_USER_POSTS, {
                        userId: user.id,
                        cursor: pageParam,
                        limit: 20,
                      });
                      const res = data?.userPosts;
                      return {
                        posts: res?.posts ?? [],
                        nextCursor: res?.nextCursor,
                        hasMore: res?.hasMore ?? false,
                      };
                    },
                    initialPageParam: undefined,
                  }),
                ]);
                return; // Success
              }
            } catch (err) {
              lastError = err;
              if (attempt < maxAttempts - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
              }
            }
          }

          console.log("Silent getMe refresh exhausted, keeping stored session");
        };

        bootstrap(); // Don't await - let it run silently

        set({
          isBootstrapping: false,
          isInitializing: false,
        });
      },

      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
    }),

    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),

      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
        mode: state.mode,
        _forceLogout: state._forceLogout,
      }),

      onRehydrateStorage: () => (state) => {
        if (!state) return;

        // Check if logout was triggered after this rehydration started
        const storedForceLogout = state._forceLogout;
        if (storedForceLogout && storedForceLogout > 0) {
          // Clear everything - logout wins
          state.user = null;
          state.tokens = null;
          state.isAuthenticated = false;
          state.mode = "unauthenticated";
          state._forceLogout = undefined;
          clearAuthTokens();
          queryClient.clear();
          return;
        }

        //  unwrap wrongly stored user
        if (state.user && (state.user as any).data) {
          const raw = state.user as any;
          state.user = raw.data;
        }

        //  restore tokens immediately
        if (state.tokens?.accessToken) {
          setAuthTokens({
            accessToken: state.tokens.accessToken,
            refreshToken: state.tokens.refreshToken,
          });
        }

        state.setHasHydrated(true);
      },
    },
  ),
);
