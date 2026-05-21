import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect } from "react";
import { AppState, Dimensions, StyleSheet, View } from "react-native";

const { width } = Dimensions.get("window");

type AnchorVideoPlayerProps = {
  video: string;
  isActive: boolean;
};

export default function AnchorVideoPlayer({
  video,
  isActive,
}: AnchorVideoPlayerProps) {

  const player = useVideoPlayer(video, (playerInstance) => {
    if (playerInstance) {
      playerInstance.loop = false;
    }
  });

  useEffect(() => {
    if (!player) return;
    try {
      if (isActive) {
        player.play();
      } else {
        player.pause();
      }
    } catch {}
  }, [player, isActive]);

  useEffect(() => {
    if (!player) return;
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        try {
          player.pause();
        } catch {}
      }
    });
    return () => {
      sub.remove();
      try {
        player.pause();
      } catch {}
    };
  }, [player]);

  return (
    <View style={styles.container}>
      {video && player ? (
        <VideoView
          player={player}
          style={styles.video}
          contentFit="cover"
          nativeControls={false}
        />
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
  video: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
});
