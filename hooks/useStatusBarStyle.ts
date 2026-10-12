import { useEffect } from "react";
import { StatusBar, Platform } from "react-native";

export function useStatusBarStyle(style: "light" | "dark") {
  useEffect(() => {
    if (Platform.OS !== "ios") return;
    StatusBar.setBarStyle(style === "light" ? "light-content" : "dark-content", true);
    return () => {
      if (Platform.OS !== "ios") return;
      StatusBar.setBarStyle("dark-content", true);
    };
  }, [style]);
}
