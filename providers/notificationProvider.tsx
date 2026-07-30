import React, { useEffect, useRef } from "react";
import { AppState, AppStateStatus, Linking, NativeModules, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import {
  getUnreadNotificationCount,
  registerDeviceToken,
} from "@/services/graphQL/queries/actions/notifications";
import { useAuthStore } from "@/store/useAuthStore";
import { isIOS } from "@/constants/platform";

let messaging: any = null;
try {
  if (NativeModules.RNFBAppModule) {
    messaging = require("@react-native-firebase/messaging").default;
  }
} catch {
  console.log("FCM native module not available — using expo-notifications device token fallback");
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
  });
}

async function requestPermissionsAndRegister() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    const { status: newStatus } = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowSound: true, allowBadge: true },
    });
    if (newStatus !== "granted") {
      console.log("🔔 Push permission denied");
      return;
    }
  }
  try {
    if (messaging) {
      const fcmToken = await messaging().getToken();
      console.log("🔔 Got FCM token:", fcmToken);
      const success = await registerDeviceToken(fcmToken, Platform.OS);
      console.log("🔔 Token registered:", success);
    } else {
      const devicePushToken = await Notifications.getDevicePushTokenAsync();
      console.log("🔔 Got device push token (FCM unavailable):", devicePushToken.data);
      const success = await registerDeviceToken(devicePushToken.data, Platform.OS);
      console.log("🔔 Token registered:", success);
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
  router.push(path);
}

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    setupAndroidChannel();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !messaging) return;

    const unsubscribe = messaging().onTokenRefresh(async (token: string) => {
      console.log("🔔 FCM token refreshed:", token);
      try {
        await registerDeviceToken(token, Platform.OS);
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
      const data = response.notification.request.content.data as Record<string, string> | undefined;
      if (!data) return;

      const { referenceType, referenceId } = data;

      if (referenceType === "post" && referenceId) {
        pushOnce(`/viewer/${referenceId}`);
      } else if (referenceType === "comment" && referenceId) {
        pushOnce(`/notifications`);
      } else if ((referenceType === "circle" || referenceType === "circle_post") && referenceId) {
        pushOnce(`/(tabs)/circle/circleFeed?id=${referenceId}`);
      } else {
        pushOnce("/notifications");
      }
    });

    const receivedSubscription = Notifications.addNotificationReceivedListener(notification => {
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

  return <>{children}</>;
}
