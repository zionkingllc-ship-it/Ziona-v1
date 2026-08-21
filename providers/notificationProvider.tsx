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
    if (messaging) {
      const fcmToken = await messaging.getToken();
      console.log("🔔 FCM token sent to backend:", fcmToken);
      await registerTokenOnce(fcmToken);
    } else {
      const devicePushToken = await Notifications.getDevicePushTokenAsync();
      await registerTokenOnce(devicePushToken.data);
    }
  } catch (err) {
    console.warn("🔔 Push token registration failed:", err);
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
  const navReady = useRootNavigationReady();
  const appState = useRef(AppState.currentState);
  const pendingResponseRef = useRef<Record<string, unknown> | null>(null);

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
      const data = response.notification.request.content.data as Record<string, unknown> | undefined;
      if (!data) return;
      pendingResponseRef.current = data;
    });

    const receivedSubscription = Notifications.addNotificationReceivedListener(notification => {
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

    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (!response) return;
        const data = response.notification.request.content.data as Record<string, unknown> | undefined;
        if (data) handleData(data);
      })
      .catch(() => {});
  }, [navReady, isAuthenticated]);

  return <>{children}</>;
}
