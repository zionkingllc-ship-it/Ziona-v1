import { useRootNavigationState } from "expo-router";

/**
 * Returns true once the root navigator has mounted and the initial route
 * has been established. All imperative navigation that can run during
 * cold start (deep links, auth redirects, notification taps) must wait for
 * this before calling router.* to avoid navigating before the Root Layout
 * mounts.
 */
export function useRootNavigationReady(): boolean {
  const rootNavigationState = useRootNavigationState();
  return rootNavigationState?.key != null && rootNavigationState.routes?.length > 0;
}