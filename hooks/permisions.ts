import * as Notifications from "expo-notifications";
import { Alert, Linking } from "react-native";

let handlerRegistered = false;

export async function useNotificationPermissions() {
  const { status } = await Notifications.getPermissionsAsync();

  if (status !== "granted") {
    const { status: newStatus } = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowSound: true },
    });
    if (newStatus !== "granted") {
      Alert.alert(
        "Notifications disabled",
        "You won't receive push notifications. You can enable them later in Settings.",
        [
          { text: "Not now", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }
  }

  if (!handlerRegistered) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldPlaySound: true,
        shouldShowList: true,
        shouldSetBadge: false,
      }),
    });

    handlerRegistered = true;
  }
}
