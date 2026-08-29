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

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userId = useAuthStore((s) => s.user?.id);
  const navReady = useRootNavigationReady();
  const appState = useRef(AppState.currentState);
  const pendingResponseRef = useRef<Record<string, unknown> | null>(null);

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
    };

    if (pendingResponseRef.current) {
      handleData(pendingResponseRef.current);
      pendingResponseRef.current = null;
    }

    // `getLastNotificationResponseAsync` returns the most recent notification
    // response the user ever interacted with, and it persists across cold
    // starts. Acting on it unconditionally routes the user to a notification
    // destination on *every* launch once they have ever tapped a push (prod
    // only). Only navigate when this is a genuinely new response we haven't
    // already handled, by remembering the last handled response identifier.
    Notifications.getLastNotificationResponseAsync()
      .then(async (response) => {
        if (!response) return;
        const id = response.notification.request.identifier;
        const lastHandled = await storage.get<string>(LAST_HANDLED_NOTIF_KEY);
        if (id && id === lastHandled) return;
        if (id) await storage.set(LAST_HANDLED_NOTIF_KEY, id);
        const data = response.notification.request.content.data as Record<string, unknown> | undefined;
        if (data) handleData(data);
      })
      .catch(() => {});
  }, [navReady, isAuthenticated]);

  return <>{children}</>;
}
