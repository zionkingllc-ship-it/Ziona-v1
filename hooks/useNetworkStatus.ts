import { useState, useEffect, useCallback } from "react";
import { AppState, AppStateStatus, Linking } from "react-native";

export type NetworkStatus = "unknown" | "online" | "offline";

export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>("unknown");
  const [isConnected, setIsConnected] = useState(true);

  const checkConnection = useCallback(async () => {
    try {
      const result = await fetch("https://www.google.com/generate_204", {
        method: "HEAD",
        cache: "no-cache",
      });
      const connected = result.ok || result.status === 204;
      setIsConnected(connected);
      setNetworkStatus(connected ? "online" : "offline");
      return connected;
    } catch {
      setIsConnected(false);
      setNetworkStatus("offline");
      return false;
    }
  }, []);

  useEffect(() => {
    checkConnection();

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        checkConnection();
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    const interval = setInterval(checkConnection, 10000);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [checkConnection]);

  return { networkStatus, isConnected, checkConnection };
}
