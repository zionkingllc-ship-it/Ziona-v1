type NotificationAuthState = {
  _hasHydrated: boolean;
  isBootstrapping: boolean;
  isInitializing: boolean;
  isAuthenticated: boolean;
  tokens: { accessToken: string | null } | null;
};

export function canQueryNotifications(state: NotificationAuthState): boolean {
  return state._hasHydrated && !state.isBootstrapping && !state.isInitializing &&
    state.isAuthenticated && Boolean(state.tokens?.accessToken);
}
