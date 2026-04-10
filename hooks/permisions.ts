// permission.ts
import * as Notifications from "expo-notifications";

let handlerRegistered = false;

export async function useNotificationPermissions() {
  const { status } = await Notifications.getPermissionsAsync();

  if (status !== "granted") {
    await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowSound: true },
    });
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
