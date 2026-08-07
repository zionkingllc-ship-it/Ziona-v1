import { useAuthStore } from "@/store/useAuthStore";
import colors from "@/constants/colors";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

/**
 * Deterministic initial route. While auth bootstraps, shows a plain spinner.
 * Once bootstrapping is done, redirects to the correct starting group.
 * Uses <Redirect>, which is readiness-safe: unlike a raw router.replace in
 * a mount effect, it never dispatches navigation before the root navigator
 * is ready (and never emits an unhandled "GO_BACK").
 */
export default function InitialRoute() {
  const isBootstrapping = useAuthStore((s) => s.isBootstrapping);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isBootstrapping) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.white }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? "/(tabs)/feed" : "/(auth)"} />;
}