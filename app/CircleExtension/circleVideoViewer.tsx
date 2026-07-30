import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useCallback, useEffect, useRef } from "react";
import { AppState, Platform, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import themeColors from "@/constants/colors";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

export default function CircleVideoViewer() {
  const router = useRouter();
  const { video } = useLocalSearchParams<{ video?: string }>();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const progress = useSharedValue(0);

  const progressStyle = useAnimatedStyle(() => ({
    width: progress.value * width,
  }));

  const seekTo = (position: number) => {
    if (!player) return;
    try {
      const duration = player.duration;
      if (!duration || duration <= 0) return;
      player.currentTime = position * duration;
    } catch { console.warn("[circleVideoViewer] seekTo failed"); }
  };

  const progressPan = Gesture.Pan()
    .onUpdate((e) => {
      const newProgress = Math.max(0, Math.min(1, e.x / width));
      progress.value = newProgress;
    })
    .onEnd(() => {
      seekTo(progress.value);
    });

  const player = useVideoPlayer(video ?? "", (playerInstance) => {
    if (playerInstance) {
      playerInstance.loop = false;
    }
  });

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
    } catch { console.warn("[circleVideoViewer] timeUpdate listener failed"); }
  }, [player]);

  useEffect(() => {
    if (player) {
      try {
        player.play();
      } catch (e) {
        console.log("Play error:", e);
      }
    }
  }, [player]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (player) {
          try { player.pause(); } catch { console.warn("[circleVideoViewer] focus cleanup pause failed"); }
        }
      };
    }, [player])
  );

  useEffect(() => {
    if (!player) return;

    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        try { player.pause(); } catch { console.warn("[circleVideoViewer] AppState pause failed"); }
      }
    });

    return () => {
      sub.remove();
      try { player.pause(); } catch { console.warn("[circleVideoViewer] cleanup pause failed"); }
    };
  }, [player]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#000" }]}>
      <View style={styles.progressBar}>
        <GestureDetector gesture={progressPan}>
          <View style={styles.progressTrackContainer}>
            <View style={styles.progressTrack}>
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

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#FFF" />
        </Pressable>
      </View>

      <View style={[styles.videoContainer, { width, height: height * 0.6 }]}>
        {video && player ? (
          <VideoView
            player={player}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            nativeControls={false}
          />
        ) : (
          <View style={styles.noVideo}>
            <Ionicons name="videocam-outline" size={48} color="#666" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressBar: {
    width: "100%",
    height: 40,
    backgroundColor: "transparent",
    pointerEvents: "box-none",
    zIndex: 100,
  },
  progressTrackContainer: {
    width: "100%",
    height: 40,
    justifyContent: "flex-end",
  },
  progressTrack: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 10,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  videoContainer: { justifyContent: "center", alignItems: "center" },
  noVideo: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
});
