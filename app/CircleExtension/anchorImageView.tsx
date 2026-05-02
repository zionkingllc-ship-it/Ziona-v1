import AnchorFooter from "@/components/circles/AnchorFooter";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import {
  SafeAreaView,
} from "react-native-safe-area-context";
import { Text } from "tamagui";

export default function AnchorImageView() {
  const router = useRouter();
  const { image, colors, likedCount, expiresAt } = useLocalSearchParams<{
    image?: string;
    colors?: string;
    likedCount?: string;
    expiresAt?: string;
  }>();

  const gradientColors: [string, string] = colors
    ? (colors.split(",") as [string, string])
    : ["#A8D5A2", "#EDEDED"];

  const scaleAnim = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  React.useEffect(() => {
    scaleAnim.value = withRepeat(withTiming(1.2, { duration: 800 }), -1, true);
  }, [scaleAnim]);

  const handleCancel = () => {
    router.back();
  };

    const handleContinue = () => {
    router.push({
      pathname: "/CircleExtension/anchorActionView",
      params: { colors: colors || "", expiresAt: expiresAt || "" },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={gradientColors} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.timerText}>23h: 10m: 23s</Text>
        </View>

        {/* Image Content */}
        <View style={styles.imageContainer}>
          {image && (
            <Image
              source={{ uri: image }}
              style={styles.image}
              resizeMode="cover"
            />
          )}
        </View>

        {/* Footer */}
        <AnchorFooter bottomOffset={-18} />

        {/* Animated Continue Button - Center Right */}
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Animated.View style={[styles.continueCircle, animatedStyle]}>
              <Text style={styles.continueCircleText}>→</Text>
            </Animated.View>
          </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  cancelText: { color: "#333", fontSize: 16 },
  timerText: { color: "#333", fontSize: 16 },
  imageContainer: {
    flex: 1,
    //justifyContent: "center",
    //alignItems: "flex-start",
    //paddingHorizontal: 16,
  },
  footerButton: {
    padding: 8,
  },
  image: { width: "100%", height: "80%", borderRadius: 24 },
  tapHint: {
    position: "absolute",
    bottom: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tapHintText: { color: "#FFF", fontSize: 14 },
  footer: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  continueArrow: {
    fontSize: 28,
    color: "#333",
    fontWeight: "300",
  },
  reflectionBox: {
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  reflectionIcon: { fontSize: 16 },
  reflectionText: { color: "#FFF", fontSize: 14 },
  continueButton: {
    position: "absolute",
    right: 16,
    top: "75%",
  },
 continueCircle: {
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  continueCircleText: {
    fontSize: 24,
    color: "#FFF",
  },
});
