import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Image, TouchableOpacity, StyleSheet, Platform, useWindowDimensions, SafeAreaView } from "react-native";
import { XStack, Text } from "tamagui";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { useVideoPlayer, VideoView } from "expo-video";


import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

export default function AnchorVideoView() {
  const router = useRouter();
  const { video, colors, likedCount } = useLocalSearchParams<{
    video?: string;
    colors?: string;
    likedCount?: string;
  }>();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [hasNavigated, setHasNavigated] = useState(false);
  const [showContinue, setShowContinue] = useState(false);

  const bottomPadding =
    Platform.OS === "android" ? Math.max(insets.bottom, 20) : insets.bottom;

  const scaleAnim = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  React.useEffect(() => {
    scaleAnim.value = withRepeat(
      withTiming(1.2, { duration: 800 }),
      -1,
      true
    );
  }, [scaleAnim]);

  const player = useVideoPlayer(video ?? "", (playerInstance) => {
    if (playerInstance) {
      playerInstance.loop = false;
    }
  });

  useEffect(() => {
    if (player) {
      try { player.play(); } catch (e) { console.log("Play error:", e); }
    }
  }, [player]);

  // Auto-show continue after video duration or 4 seconds fallback
  useEffect(() => {
    if (!player) return;
    
    const checkEnd = () => {
      try {
        const duration = player.duration;
        const currentTime = player.currentTime;
        if (duration > 0 && currentTime >= duration - 0.5 && !showContinue) {
          setShowContinue(true);
        }
      } catch {}
    };
    
    const remove = player.addListener("timeUpdate", checkEnd as any);
    return () => remove.remove();
  }, [player, showContinue]);

  // Backup timer in case events don't fire
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!showContinue) {
        setShowContinue(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleCancel = () => {
    router.back();
  };

  const handleContinue = () => {
    if (!hasNavigated) {
      setHasNavigated(true);
      router.push({ pathname: "/CircleExtension/anchorActionView", params: { colors: colors || "" } });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#000" }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.timerText}>23h: 10m: 23s</Text>
      </View>

      {/* Video Content - Full Screen */}
      <TouchableOpacity 
        style={[styles.videoContainer, { width, height: height * 0.6 }]}
        onPress={showContinue ? handleContinue : undefined}
        activeOpacity={showContinue ? 0.8 : 1}
      >
        {video && player ? (
          <VideoView
            player={player}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            nativeControls={false}
          />
        ) : (
          <View style={styles.noVideo}>
            <Text style={styles.noVideoText}>No video available</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Animated Continue Button - Center Right */}
      {showContinue && (
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Animated.View style={[styles.continueCircle, animatedStyle]}>
            <Text style={styles.continueCircleText}>→</Text>
          </Animated.View>
        </TouchableOpacity>
      )}

      {/* Footer */}
        <View style={[styles.footer, { bottom: 30 + bottomPadding }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.footerButton}
          >
            <Image
              source={require("@/assets/images/AnchorPrayingHandDark.png")}
              style={{ width: 22, height: 22 }}
            />
          </TouchableOpacity>
          <XStack
            backgroundColor="#000"
            paddingHorizontal="$3"
            paddingVertical="$2"
            borderRadius={20}
            alignItems="center"
            gap="$2"
          >
            <Ionicons name="chatbubble-outline" size={16} color="#FFF" />
            <Text color="#FFF">Your reflection...</Text>
          </XStack>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  cancelText: { color: "#FFF", fontSize: 16 },
  timerText: { color: "#FFF", fontSize: 16 },
  videoContainer: { justifyContent: "center", alignItems: "center" },
  noVideo: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
    footerButton: {
    padding: 8,
  },
  noVideoText: { color: "#FFF", fontSize: 16 },
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
  continueCircleText: {
    fontSize: 24,
    color: "#FFF",
  },
  continueText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
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