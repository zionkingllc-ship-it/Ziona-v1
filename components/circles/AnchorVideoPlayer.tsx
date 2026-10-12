import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, AppState, Dimensions, Pressable, StyleSheet, View } from "react-native";

import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

type AnchorVideoPlayerProps = {
  video: string;
  isActive: boolean;
};

export default function AnchorVideoPlayer({
  video,
  isActive,
}: AnchorVideoPlayerProps) {
  const [showControls, setShowControls] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [playerStatus, setPlayerStatus] = useState<
    "idle" | "loading" | "readyToPlay" | "error"
  >("idle");

  const progress = useSharedValue(0);

  const progressStyle = useAnimatedStyle(() => ({
    width: progress.value * width,
  }));

  const player = useVideoPlayer(video, (playerInstance) => {
    if (playerInstance) {
      playerInstance.loop = false;
    }
  });

  useEffect(() => {
    if (!player) return;
    const sub = player.addListener("statusChange", ({ status }) => {
      setPlayerStatus(status);
    });
    return () => sub.remove();
  }, [player]);

  const seekTo = useCallback((position: number) => {
    if (!player) return;
    try {
      const duration = player.duration;
      if (!duration || duration <= 0) return;
      player.currentTime = position * duration;
    } catch { console.warn("[AnchorVideoPlayer] seekTo failed"); }
  }, [player]);

  const seekPan = Gesture.Pan()
    .onUpdate((e) => {
      const newProgress = Math.max(0, Math.min(1, e.x / width));
      progress.value = newProgress;
    })
    .onEnd(() => {
      seekTo(progress.value);
    });

  const togglePlayPause = useCallback(() => {
    if (!player) return;
    try {
      if (isPaused) {
        player.play();
      } else {
        player.pause();
      }
      setIsPaused(!isPaused);
    } catch { console.warn("[AnchorVideoPlayer] togglePlayPause failed"); }
  }, [player, isPaused]);

  const toggleControls = useCallback(() => {
    setShowControls((prev) => !prev);
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
    } catch { console.warn("[AnchorVideoPlayer] timeUpdate listener failed"); }
  }, [player]);

  useEffect(() => {
    if (!player) return;
    const sub = player.addListener("playToEnd", () => {
      try {
        player.currentTime = 0;
        player.pause();
        progress.value = 0;
        setIsPaused(true);
      } catch { console.warn("[AnchorVideoPlayer] playToEnd handler failed"); }
    });
    return () => sub.remove();
  }, [player]);

  useEffect(() => {
    if (!player) return;
    try {
      if (isActive) {
        player.play();
        setIsPaused(false);
      } else {
        player.pause();
        setIsPaused(true);
      }
    } catch { console.warn("[AnchorVideoPlayer] isActive toggle failed"); }
  }, [player, isActive]);

  useEffect(() => {
    if (!player) return;
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        try {
          player.pause();
          setIsPaused(true);
        } catch { console.warn("[AnchorVideoPlayer] AppState pause failed"); }
      }
    });
    return () => {
      sub.remove();
      try {
        player.pause();
      } catch { console.warn("[AnchorVideoPlayer] cleanup pause failed"); }
    };
  }, [player]);

  return (
    <View style={styles.container}>
      {video && player ? (
        <Pressable onPress={toggleControls} style={styles.videoWrapper}>
          <VideoView
            player={player}
            style={styles.video}
            contentFit="contain"
            nativeControls={false}
          />

          {playerStatus === "loading" && (
            <View style={[StyleSheet.absoluteFill, styles.loadingOverlay]}>
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
          )}

          {playerStatus === "error" && (
            <View style={[StyleSheet.absoluteFill, styles.errorOverlay]}>
              <Ionicons name="videocam" size={40} color="#FFF" />
            </View>
          )}

          {showControls && (
            <>
              <View style={styles.overlay}>
                <Pressable onPress={togglePlayPause} style={styles.playButton}>
                  <Ionicons
                    name={isPaused ? "play" : "pause"}
                    size={48}
                    color="#FFF"
                  />
                </Pressable>
              </View>

              <View style={styles.progressBar}>
                <GestureDetector gesture={seekPan}>
                  <View style={styles.progressTrackContainer}>
                    <View style={styles.progressTrack}>
                      <Animated.View style={[styles.progressFill, progressStyle]} />
                    </View>
                  </View>
                </GestureDetector>
              </View>
            </>
          )}
        </Pressable>
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="videocam" size={48} color="#FFF" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  videoWrapper: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  progressBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: "transparent",
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
  progressFill: {
    height: "100%",
    backgroundColor: "#742092",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingOverlay: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  errorOverlay: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
});
