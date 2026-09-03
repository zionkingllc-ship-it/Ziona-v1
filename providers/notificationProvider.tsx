import React, { useEffect, useRef } from "react";
import { AppState, AppStateStatus, Linking, NativeModules, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import {
  getUnreadNotificationCount,
  registerDeviceToken,
} from "@/services/graphQL/queries/actions/notifications";
import { useAuthStore } from "@/store/useAuthStore";
import { useRootNavigationReady } from "@/hooks/useRootNavigationReady";
import { isIOS } from "@/constants/platform";
import { resolveNotificationDestination } from "@/src/services/notifications/notificationNavigation";
import { emitNotificationReceived } from "@/src/services/notifications/notificationService";
import { storage } from "@/utils/storage";

const LAST_HANDLED_NOTIF_KEY = "lastHandledNotificationId";

// In-memory set to track handled IDs in current session (prevents duplicate navigation)
const handledNotificationIds = new Set<string>();

let messaging: any = null;
try {
  if (NativeModules.RNFBAppModule) {
    const { getApp } = require("@react-native-firebase/app");
    const {
      getMessaging,
      getToken: rnfbGetToken,
      onTokenRefresh: rnfbOnTokenRefresh,
    } = require("@react-native-firebase/messaging");
    const messagingApi = getMessaging(getApp());
    messaging = {
      getToken: () => rnfbGetToken(messagingApi),
      onTokenRefresh: (handler: (token: string) => void) =>
        rnfbOnTokenRefresh(messagingApi, handler),
    };
  }
} catch {}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function setupAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#742092",
  });
}

let registrationInFlight: Promise<void> | null = null;
let registeredToken: string | null = null;

async function serializeRegistration(run: () => Promise<void>): Promise<void> {
  if (registrationInFlight) return registrationInFlight;
  registrationInFlight = (async () => {
    try {
      await run();
    } finally {
      registrationInFlight = null;
    }
  })();
  return registrationInFlight;
}

async function registerTokenOnce(token: string): Promise<void> {
  if (!token || token === registeredToken) return;

  await serializeRegistration(async () => {
    if (token === registeredToken) return;
    console.log("[Notifications] device token:", token);
    const registered = await registerDeviceToken(token, Platform.OS);
    if (registered) registeredToken = token;
  });
}

async function requestPermissionsAndRegister() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      const { status: newStatus } = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowSound: true, allowBadge: true },
      });
      if (newStatus !== "granted") {
        return;
      }
    }
    try {
      if (!messaging) {
        console.warn("[Notifications] Firebase Messaging unavailable — skipping token registration");
        return;
      }
      const fcmToken = await messaging.getToken();
      console.log("🔔 FCM token sent to backend:", fcmToken);
      await registerTokenOnce(fcmToken);
    } catch (err) {
      console.warn("🔔 Push token registration failed:", err);
    }
  } catch (err) {
    console.warn("🔔 Permission registration failed:", err);
  }
}

async function syncBadgeFromServer() {
  try {
    const count = await getUnreadNotificationCount();
    await Notifications.setBadgeCountAsync(count);
  } catch { console.warn("[notificationProvider] syncBadgeFromServer failed"); }
}

let lastNavPath = "";
let lastNavTime = 0;

function pushOnce(path: string) {
  const now = Date.now();
  if (path === lastNavPath && now - lastNavTime < 2000) return;
  lastNavPath = path;
  lastNavTime = now;
  router.push(path as any);
}

// Atomic storage helper: read, compare, write in one async operation
async function tryMarkHandled(id: string): Promise<boolean> {
  if (!id) return false;
  // Fast path: check in-memory set first
  if (handledNotificationIds.has(id)) {
    console.log("[Notifications] already handled in session:", id);
    return false;
  }
  try {
    const lastHandled = await storage.get<string>(LAST_HANDLED_NOTIF_KEY);
    if (id === lastHandled) {
      handledNotificationIds.add(id);
      console.log("[Notifications] already handled in storage:", id);
      return false;
    }
    // Mark as handled
    await storage.set(LAST_HANDLED_NOTIF_KEY, id);
    handledNotificationIds.add(id);
    console.log("[Notifications] marked as handled:", id);
    return true;
  } catch (err) {
    console.warn("[Notifications] storage error:", err);
    return false;
  }
}

// Clear stored ID after successful navigation (prevents stale re-trigger)
async function clearHandled() {
  try {
    await storage.delete(LAST_HANDLED_NOTIF_KEY);
    handledNotificationIds.clear();
    console.log("[Notifications] cleared handled ID");
  } catch { /* ignore */ }
}

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userId = useAuthStore((s) => s.user?.id);
  const navReady = useRootNavigationReady();
  const appState = useRef(AppState.currentState);
  const pendingResponseRef = useRef<Record<string, unknown> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    if (isAuthenticated) {
      console.log("[Notifications] user ID:", userId);
    }
  }, [isAuthenticated, userId]);

  useEffect(() => {
    setupAndroidChannel();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !messaging) return;

    const unsubscribe = messaging.onTokenRefresh(async (token: string) => {
      try {
        await registerTokenOnce(token);
      } catch (err) {
        console.warn("🔔 Token refresh registration failed:", err);
      }
    });

    return unsubscribe;
  }, [isAuthenticated]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextState === "active") {
        if (isAuthenticated) {
          requestPermissionsAndRegister();
          syncBadgeFromServer();
        }
      }
      appState.current = nextState;
    });

    if (isAuthenticated) {
      requestPermissionsAndRegister();
      syncBadgeFromServer();
    }

    return () => subscription.remove();
  }, [isAuthenticated]);

  useEffect(() => {
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("[Notifications] notification ID opened:", response.notification.request.identifier);
      const data = response.notification.request.content.data as Record<string, unknown> | undefined;
      if (!data) return;
      pendingResponseRef.current = data;
    });

    const receivedSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log("[Notifications] notification ID received:", notification.request.identifier);
      emitNotificationReceived(notification);
      if (isIOS) {
        const badge = notification.request.content.badge;
        if (badge != null) {
          Notifications.setBadgeCountAsync(Number(badge)).catch(() => {});
        }
      }
    });

    return () => {
      responseSubscription.remove();
      receivedSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!navReady || !isAuthenticated) return;

    const handleData = (data: Record<string, unknown>) => {
      pushOnce(resolveNotificationDestination(data));
      // Clear stored ID after successful navigation so next launch doesn't re-trigger
      clearHandled();
    };

    // Handle pending response from when app was backgrounded
    if (pendingResponseRef.current) {
      handleData(pendingResponseRef.current);
      pendingResponseRef.current = null;
    }

    // On cold start, check for a genuinely new notification response
    Notifications.getLastNotificationResponseAsync()
      .then(async (response) => {
        if (!isMountedRef.current) return;
        if (!response) return;
        const id = response.notification.request.identifier;
        console.log("[Notifications] cold start last response:", id);
        
        // Only navigate if this is a new unhandled notification
        const shouldHandle = await tryMarkHandled(id);
        if (!shouldHandle) {
          console.log("[Notifications] skipping already-handled notification:", id);
          return;
        }
        
        const data = response.notification.request.content.data as Record<string, unknown> | undefined;
        if (data) handleData(data);
      })
      .catch(() => {});

    return () => {
      isMountedRef.current = false;
    };
  }, [navReady, isAuthenticated]);

  return <>{children}</>;
}