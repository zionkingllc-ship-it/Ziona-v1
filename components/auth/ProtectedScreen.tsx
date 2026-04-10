import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import colors from "@/constants/colors";

export default function ProtectedScreen({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isBootstrapping = useAuthStore((s) => s.isBootstrapping);

  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isBootstrapping) return;

    if (!isAuthenticated) {
      router.replace("/(auth)");
      return;
    }

    setShouldRender(true);
  }, [isAuthenticated, isBootstrapping]);

  if (!shouldRender) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator color={colors.primary}  size={40}/>
      </View>
    );
  }

  return <>{children}</>;
}