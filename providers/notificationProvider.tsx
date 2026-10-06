import { isIOS } from "@/constants/platform";
import { useRootNavigationReady } from "@/hooks/useRootNavigationReady";
import {
    getUnreadNotificationCount,
    registerDeviceToken,
} from "@/services/graphQL/queries/actions/notifications";
import { createDeviceRegistration } from "@/src/services/notifications/deviceRegistration";
import { resolveNotificationDestination } from "@/src/services/notifications/notificationNavigation";
import { emitNotificationReceived } from "@/src/services/notifications/notificationService";
import { useAuthStore } from "@/store/useAuthStore";
import { storage } from "@/utils/storage";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
    Alert,
    AppState,
    AppStateStatus,
    Linking,
    NativeModules,
    Platform,
} from "react-native";

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
} catch (error) {
  console.error("[Notifications] Firebase Messaging initialization failed:", error);
}

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
    sound: "default",
  });
}

async function requestPermissionsAndRegister(
  registerToken: (token: string) => Promise<void>,
  isCurrentSession: () => boolean,
  permissionPromptAttempted: { current: boolean },
) {
  try {
    await setupAndroidChannel();
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      if (permissionPromptAttempted.current) return;
      permissionPromptAttempted.current = true;
      const permission = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowSound: true, allowBadge: true },
      });
      if (permission.status !== "granted") {
        if (!permission.canAskAgain) {
          Alert.alert(
            "Notifications are off",
            "Allow notifications in your device settings to receive updates from Ziona.",
            [
              { text: "Not now", style: "cancel" },
              {
                text: "Open settings",
                onPress: () => {
                  void Linking.openSettings().catch(() => {});
                },
              },
            ],
          );
        }
        return;
      }
    }
    try {
      if (!messaging) {
        console.warn(
          "[Notifications] Firebase Messaging unavailable — skipping token registration",
        );
        return;
      }
      if (!isCurrentSession()) return;
      const fcmToken = await messaging.getToken();
      await registerToken(fcmToken);
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
  } catch {
    console.warn("[notificationProvider] syncBadgeFromServer failed");
  }
}

let lastNavPath = "";
let lastNavTime = 0;

function pushOnce(href: { pathname: string; params?: Record<string, string> }) {
  const key = JSON.stringify(href);
  const now = Date.now();
  if (key === lastNavPath && now - lastNavTime < 2000) return;
  lastNavPath = key;
  lastNavTime = now;
  router.push(href as any);
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
    await Notifications.clearLastNotificationResponseAsync();
    await storage.remove(LAST_HANDLED_NOTIF_KEY);
    handledNotificationIds.clear();
    console.log("[Notifications] cleared handled ID");
  } catch {
    /* ignore */
  }
}

export default function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
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
    if (!isAuthenticated || !userId) return;
    let active = true;
    const isCurrentSession = () => {
      const auth = useAuthStore.getState();
      return active && auth.isAuthenticated && auth.user?.id === userId;
    };
    const registerToken = createDeviceRegistration(
      (token) => registerDeviceToken(token, Platform.OS),
      isCurrentSession,
      () =>
        console.log("[Notifications] FCM device token registration confirmed", {
          userId,
          platform: Platform.OS,
        }),
    );
    const unsubscribe = messaging?.onTokenRefresh(async (token: string) => {
      try {
        await registerToken(token);
      } catch (err) {
        console.warn("[Notifications] Token refresh registration failed:", err);
      }
    });
    const permissionPromptAttempted = { current: false };
    const registerAndSync = () => {
      if (!isCurrentSession()) return;
      void requestPermissionsAndRegister(
        registerToken,
        isCurrentSession,
        permissionPromptAttempted,
      );
      void syncBadgeFromServer();
    };
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextState === "active"
        ) {
          registerAndSync();
        }
        appState.current = nextState;
      },
    );
    registerAndSync();
    return () => {
      active = false;
      unsubscribe?.();
      subscription.remove();
    };
  }, [isAuthenticated, userId]);

  useEffect(() => {
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(
          "[Notifications] notification ID opened:",
          response.notification.request.identifier,
        );
        const data = response.notification.request.content.data as
          | Record<string, unknown>
          | undefined;
        if (!data) return;
        pendingResponseRef.current = data;
      });

    const receivedSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log(
          "[Notifications] notification ID received:",
          notification.request.identifier,
        );
        emitNotificationReceived(notification);
        if (isIOS) {
          const badge = notification.request.content.badge;
          if (badge != null) {
            Notifications.setBadgeCountAsync(Number(badge)).catch(() => {});
          }
        }
      },
    );

    return () => {
      responseSubscription.remove();
      receivedSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!navReady || !isAuthenticated) return;

    const handleData = (data: Record<string, unknown>) => {
      const href = resolveNotificationDestination(data);
      if (href) pushOnce(href);
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
          console.log(
            "[Notifications] skipping already-handled notification:",
            id,
          );
          return;
        }

        const data = response.notification.request.content.data as
          | Record<string, unknown>
          | undefined;
        if (data) handleData(data);
      })
      .catch(() => {});

    return () => {
      isMountedRef.current = false;
    };
  }, [navReady, isAuthenticated]);

  return <>{children}</>;
}
