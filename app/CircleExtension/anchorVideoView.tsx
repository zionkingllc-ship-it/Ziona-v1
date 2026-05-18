import AnchorFooter from "@/components/circles/AnchorFooter";
import CountdownTimer from "@/components/ui/CountdownTimer";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useCallback, useEffect, useRef } from "react";
import { AppState, Platform, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "tamagui";

import themeColors from "@/constants/colors";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

export default function AnchorVideoView() {
  const router = useRouter();
  const {
    video,
    colors: colorsParam,
      expiresAt,
      circleId,
      id,
      expired,
    } = useLocalSearchParams<{
      video?: string;
      colors?: string;
      expiresAt?: string;
      circleId?: string;
      id?: string;
      expired?: string;
    }>();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const hasNavigatedRef = useRef(false);

  const bottomPadding =
    Platform.OS === "android" ? Math.max(insets.bottom, 20) : insets.bottom;

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
    } catch {}
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
    } catch {}
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

  // Pause video when screen loses focus or app goes to background
  useFocusEffect(
    useCallback(() => {
      return () => {
        if (player) {
          try { player.pause(); } catch {}
        }
      };
    }, [player])
  );

  useEffect(() => {
    if (!player) return;

    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        try { player.pause(); } catch {}
      }
    });

    return () => {
      sub.remove();
      try { player.pause(); } catch {}
    };
  }, [player]);

  useEffect(() => {
    if (!player || hasNavigatedRef.current) return;

    const handleVideoEnd = () => {
      if (hasNavigatedRef.current) return;
      hasNavigatedRef.current = true;
      setTimeout(() => {
        router.push({
          pathname: "/CircleExtension/anchorActionView",
          params: {
            colors: colorsParam || "",
            expiresAt: expiresAt || "",
            anchorType: "video",
            ...(circleId ? { circleId } : {}),
          },
        });
      }, 2000);
    };

    const checkEnd = () => {
      try {
        const duration = player.duration;
        const currentTime = player.currentTime;
        if (duration > 0 && currentTime >= duration - 0.5) {
          handleVideoEnd();
        }
      } catch {}
    };

    const remove = player.addListener("timeUpdate", checkEnd as any);
    return () => remove.remove();
  }, [player, colorsParam, expiresAt, router]);

  return (
    <View style={[styles.container, { backgroundColor: "#000" }]}>
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

      <View style={[styles.header, { marginTop: 10 }]}>
        <View style={{ width: 60 }} />
        <CountdownTimer expiresAt={expiresAt || ""} style={styles.timerText} />
      </View>

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

      <AnchorFooter anchorId={id} expired={expired === "1"} />
    </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  timerText: { color: "#FFF", fontSize: 16 },
  videoContainer: { justifyContent: "center", alignItems: "center" },
  noVideo: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  noVideoText: { color: "#FFF", fontSize: 16 },
});