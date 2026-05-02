import AnchorFooter from "@/components/circles/AnchorFooter";
import CountdownTimer from "@/components/ui/CountdownTimer";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions, 
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SafeAreaView } from "react-native-safe-area-context/src/SafeAreaView";
import { Text,View } from "tamagui";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { GestureDetector, Gesture } from "react-native-gesture-handler";
import themeColors from "@/constants/colors";

export default function AnchorVideoView() {
  const router = useRouter();
  const { video, colors: colorsParam, likedCount, expiresAt } = useLocalSearchParams<{
    video?: string;
    colors?: string;
    likedCount?: string;
    expiresAt?: string;
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
    scaleAnim.value = withRepeat(withTiming(1.2, { duration: 800 }), -1, true);
  }, [scaleAnim]);

  const player = useVideoPlayer(video ?? "", (playerInstance) => {
    if (playerInstance) {
      playerInstance.loop = false;
    }
  });

  const progress = useSharedValue(0);

  useEffect(() => {
    if (!player) return;
    try {
      player.timeUpdateEventInterval = 0.5;
      const sub = player.addListener("timeUpdate", ({ currentTime }) => {
        const duration = player.duration;
        if (duration > 0) {
          progress.value = currentTime / duration;
        }
      });
      return () => sub.remove();
    } catch {}
  }, [player]);

  const seekTo = (position: number) => {
    if (!player) return;
    try {
      const duration = player.duration;
      if (!duration || duration <= 0) return;
      player.currentTime = position * duration;
    } catch {}
  };

  const progressStyle = useAnimatedStyle(() => ({
    width: progress.value * width,
  }));

  const progressPan = Gesture.Pan()
    .onUpdate((e) => {
      const newProgress = Math.max(0, Math.min(1, e.x / width));
      progress.value = newProgress;
    })
    .onEnd(() => {
      seekTo(progress.value);
    });

  useEffect(() => {
    if (player) {
      try {
        player.play();
      } catch (e) {
        console.log("Play error:", e);
      }
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

  const handleContinue = () => {
    if (!hasNavigated) {
      setHasNavigated(true);
      router.push({
        pathname: "/CircleExtension/anchorActionView",
        params: { colors: colorsParam || "", expiresAt: expiresAt || "" },
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#000" }]}>
      {/* Header with Timer only */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={{ width: 60 }} />
        <CountdownTimer expiresAt={expiresAt || ""} style={styles.timerText} />
      </View>

      {/* PROGRESS BAR - above video */}
      <View
        width={width}
        height={40}
        backgroundColor="transparent"
        pointerEvents="box-none"
        zIndex={100}
      >
        <GestureDetector gesture={progressPan}>
          <View width="100%" height={40} justifyContent="flex-end">
            <View
              width="100%"
              height={6}
              backgroundColor="rgba(255,255,255,0.3)"
            >
              <Animated.View
                style={[
                  { height: "100%", backgroundColor: themeColors.secondary },
                  progressStyle,
                ]}
              />
            </View>
          </View>
        </GestureDetector>
      </View>

      {/* Video Content */}
      <View style={[styles.videoContainer, { width, height: height * 0.6 }]}>
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
      </View>

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
      <AnchorFooter />
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
