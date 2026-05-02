import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
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
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Text, XStack } from "tamagui";
import AnchorFooter from "@/components/circles/AnchorFooter";
import CountdownTimer from "@/components/ui/CountdownTimer";

export default function AnchorImageTextView() {
  const router = useRouter();
  const { image, text, colors, likedCount, expiresAt } = useLocalSearchParams<{
    image?: string;
    text?: string;
    colors?: string;
    likedCount?: string;
    expiresAt?: string;
  }>();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const gradientColors: [string, string] = colors
    ? (colors.split(",") as [string, string])
    : ["rgba(0,0,0,0.3)", "rgba(0,0,0,0.6)"];

  const bottomPadding =
    Platform.OS === "android" ? Math.max(insets.bottom, 20) : insets.bottom;

  const scaleAnim = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  React.useEffect(() => {
    scaleAnim.value = withRepeat(withTiming(1.2, { duration: 800 }), -1, true);
  }, [scaleAnim]);

  const handleContinue = () => {
    router.push({
      pathname: "/CircleExtension/anchorActionView",
      params: { colors: colors || "", expiresAt: expiresAt || "" },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={{ uri: image }}
        style={[styles.backgroundImage, { width, height }]}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.7)"]}
        style={styles.overlay}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <CountdownTimer 
          expiresAt={expiresAt || ""} 
          style={styles.timerText}
        />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.contentText} numberOfLines={10}>
          {text}
        </Text>
      </View>

      <AnchorFooter prayIcon={require("@/assets/images/AnchorPrayingHandLight.png")} />

      {/* Animated Continue Button - Center Right */}
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Animated.View style={[styles.continueCircle, animatedStyle]}>
          <Text style={styles.continueArrow}>→</Text>
        </Animated.View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { position: "absolute", top: 0, left: 0 },
  overlay: { ...StyleSheet.absoluteFillObject },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  cancelText: { color: "#FFF", fontSize: 16 },
  timerText: { color: "#FFF", fontSize: 16 },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  footerButton: {
    padding: 8,
  },
  contentText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 28,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  footer: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  continueButton: {
    position: "absolute",
    right: 16,
    top: "75%",
  },
  continueCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  continueArrow: {
    fontSize: 24,
    color: "#FFF",
    fontWeight: "300",
  },
  reflectionBox: {
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  reflectionIcon: { fontSize: 16 },
  reflectionText: { color: "#FFF", fontSize: 14 },
});
