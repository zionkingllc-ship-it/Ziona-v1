import { GET_USER_POSTS } from "@/hooks/useUserPost";
import { queryClient } from "@/lib/queryClient";
import { authApi } from "@/services/api/authApi";
import { clearAuthTokens, setAuthTokens } from "@/services/api/client";
import { graphqlRequest } from "@/services/graphQL/graphqlClient";
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

      logout: async () => {
        try {
          await authApi.signOut();
        } catch {}

        clearAuthTokens();

        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          mode: "unauthenticated",
        });

        await AsyncStorage.removeItem("auth-storage");
        queryClient.clear(); // 🔥 ensure no stale cache
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

        try {
          const userRes = await authApi.getMe();

          // normalize again (backend inconsistency safe)
          const user = userRes?.data ?? userRes;

          set({
            user,
            isAuthenticated: true,
            mode: "authenticated",
          });

          //  PREFETCH
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
        } catch (err) {
          console.log("Auth verification failed");
        }

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
      }),

      onRehydrateStorage: () => (state) => {
        if (!state) return;

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
