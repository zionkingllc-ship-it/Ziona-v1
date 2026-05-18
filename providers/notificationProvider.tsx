import React, { useEffect } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { registerDeviceToken } from "@/services/graphQL/queries/actions/notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function requestPermissionsAndRegister() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    const { status: newStatus } = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowSound: true },
    });
    if (newStatus !== "granted") return;
  }
  try {
    const expoPushToken = await Notifications.getExpoPushTokenAsync();
    await registerDeviceToken(expoPushToken.data, Platform.OS);
  } catch (err) {
    console.warn("Push token registration failed:", err);
  }
}

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    requestPermissionsAndRegister();

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as Record<string, string> | undefined;
      if (!data) return;

      const { referenceType, referenceId } = data;

      if (referenceType === "post" && referenceId) {
        router.push(`/viewer/${referenceId}`);
      } else if (referenceType === "comment" && referenceId) {
        router.push(`/notifications`);
      } else if ((referenceType === "circle" || referenceType === "circle_post") && referenceId) {
        router.push(`/(tabs)/circle/circleFeed?id=${referenceId}`);
      } else {
        router.push("/notifications");
      }
    });

    return () => {
      responseSubscription.remove();
    };
  }, []);

  return <>{children}</>;
}
