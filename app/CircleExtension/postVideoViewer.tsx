import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import colors from "@/constants/colors";
import { Play } from "@tamagui/lucide-icons";

export default function PostVideoViewer() {
  const router = useRouter();
  const { video } = useLocalSearchParams<{ video?: string }>();
  const insets = useSafeAreaInsets();
  const [playing, setPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const screenWidth = useRef(400);

  const progress = useSharedValue(0);

  const player = useVideoPlayer(video ?? "", (playerInstance) => {
    if (playerInstance) {
      playerInstance.loop = false;
    }
  });

  const seekTo = useCallback(
    (position: number) => {
      if (!player) return;
      try {
        const duration = player.duration;
        if (!duration || duration <= 0) return;
        player.currentTime = position * duration;
      } catch {}
    },
    [player],
  );

  const handleSeek = useCallback(
    (newProgress: number) => {
      progress.value = newProgress;
      seekTo(newProgress);
    },
    [seekTo],
  );

  const hideControls = useCallback(() => {
    setShowControls(false);
  }, []);

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(hideControls, 3000);
  }, [hideControls]);

  const handleTap = useCallback(() => {
    setPlaying((prev) => !prev);
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  useEffect(() => {
    return () => {
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
    };
  }, []);

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
    if (!player) return;
    if (playing) {
      try { player.play(); } catch {}
    } else {
      try { player.pause(); } catch {}
    }
  }, [playing, player]);

  useEffect(() => {
    if (!player) return;
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        try { player.pause(); } catch {}
        setPlaying(false);
      }
    });
    return () => {
      sub.remove();
      try { player.pause(); } catch {}
    };
  }, [player]);

  const progressStyle = useAnimatedStyle(() => ({
    width: progress.value * screenWidth.current,
  }));

  const progressPan = Gesture.Pan()
    .onUpdate((e) => {
      const newProgress = Math.max(0, Math.min(1, e.x / screenWidth.current));
      progress.value = newProgress;
    })
    .onEnd(() => {
      runOnJS(handleSeek)(progress.value);
    });

  return (
    <SafeAreaView style={styles.container}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={handleTap}
        onLayout={(e) => { screenWidth.current = e.nativeEvent.layout.width; }}
      >
        {player && (
          <VideoView
            player={player}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            nativeControls={false}
            pointerEvents="none"
          />
        )}

        {!playing && (
          <View style={styles.playOverlay}>
            <View style={styles.playButton}>
              <Play size={28} color={colors.black} fill={colors.black} />
            </View>
          </View>
        )}
      </Pressable>

      {showControls && (
        <Pressable
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color="#FFF" />
        </Pressable>
      )}

      {showControls && (
        <View style={styles.progressBarContainer}>
          <GestureDetector gesture={progressPan}>
            <View style={styles.progressTrackContainer}>
              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressFill, progressStyle]} />
              </View>
            </View>
          </GestureDetector>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  closeButton: {
    position: "absolute",
    top: 45,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFF1DB",
    justifyContent: "center",
    alignItems: "center",
  },
  progressBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: "transparent",
    zIndex: 100,
  },
  progressTrackContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  progressTrack: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.secondary,
  },
});
