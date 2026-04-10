import React, { useEffect } from "react";
import * as Notifications from "expo-notifications";

// Configure foreground notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({ 
    shouldShowBanner: true, // new
    shouldShowList: true,   // new
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Listen to incoming notifications
    // const subscription = Notifications.addNotificationReceivedListener(notification => {
    //   console.log("In-app notification:", notification);
    // });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("Notification tapped:", response);
    });

    return () => {
//subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return <>{children}</>;
}
