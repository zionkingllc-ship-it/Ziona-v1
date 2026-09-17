import { useEffect } from "react";
import { Platform } from "react-native";
import * as TrackingTransparency from "expo-tracking-transparency";
import { setAdvertiserTrackingEnabled } from "@/services/analytics/metaEvents";

let hasRequested = false;

/**
 * Requests iOS App Tracking Transparency permission, gated by `ready` so
 * callers can delay it until the user has seen real app content — per
 * Apple's guidance, not immediately on first launch. No-ops on Android/web.
 */
export function useAppTrackingTransparency(ready: boolean) {
  useEffect(() => {
    if (!ready || hasRequested || Platform.OS !== "ios") return;
    hasRequested = true;

    (async () => {
      const current = await TrackingTransparency.getTrackingPermissionsAsync();

      const granted =
        current.status === "undetermined"
          ? (await TrackingTransparency.requestTrackingPermissionsAsync()).granted
          : current.granted;

      setAdvertiserTrackingEnabled(granted);
    })();
  }, [ready]);
}
