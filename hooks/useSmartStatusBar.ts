import { useEffect } from "react";
import { StatusBar, Platform } from "react-native";
import { usePathname } from "expo-router";
import { statusBarRouteMap } from "@/config/statusBarConfig";

export function useSmartStatusBar() {
  const pathname = usePathname();

  useEffect(() => {
    if (Platform.OS !== "ios") return;

    const match = statusBarRouteMap.find((entry) =>
      pathname.startsWith(entry.route)
    );
    const style = match?.style ?? "dark";

    StatusBar.setBarStyle(
      style === "light" ? "light-content" : "dark-content",
      true
    );
  }, [pathname]);
}
