import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import colors from "@/constants/colors";
import { Text, YStack, XStack, TouchableOpacity } from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";

interface NetworkStatusBannerProps {
  minimal?: boolean;
}

export function NetworkStatusBanner({ minimal = false }: NetworkStatusBannerProps) {
  const { isConnected, checkConnection } = useNetworkStatus();
  const insets = useSafeAreaInsets();

  if (isConnected) return null;

  return (
    <YStack
      style={[
        styles.banner,
        { paddingTop: (insets.top || 0) + 8, paddingBottom: 8 },
      ]}
      backgroundColor={colors.warning}
    >
      <XStack flex={1} alignItems="center" justifyContent="center" gap="$2">
        <Text style={styles.icon}>📶</Text>
        <Text style={styles.text} color={colors.black}>
          No internet connection
        </Text>
        <TouchableOpacity
          onPress={checkConnection}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.retry, { color: colors.black }]}>
            Tap to retry
          </Text>
        </TouchableOpacity>
      </XStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: "100%",
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  icon: {
    fontSize: 14,
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "$body",
  },
  retry: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "$body",
    textDecorationLine: "underline",
  },
});
