import { Image } from "expo-image";
import React, { useCallback, useEffect, useRef, useState, memo } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useVideoPlayer, VideoView } from "expo-video";
import { View } from "tamagui";
import { Play } from "@tamagui/lucide-icons";
import colors from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";

interface Props {
  post: any;
  isPlaying: boolean;
  onTogglePlay?: () => void;
  onLike?: () => void;
  onDoubleTapLike?: () => void;
  heartStyle: any;
  triggerHeart: () => void;
  screenWidth: number;
  screenHeight: number;
  tabBarHeight: number;
}

function VideoPostCardComponent({
  post,
  isPlaying,
  onTogglePlay,
  onLike,
  onDoubleTapLike,
  heartStyle,
  triggerHeart,
  screenWidth,
  screenHeight,
}: Props) {
  const videoUrl = post.media?.[0]?.url;
  const thumbnailUrl = post.media?.[0]?.thumbnailUrl;

  const progress = useSharedValue(0);
  const [hasFirstFrame, setHasFirstFrame] = useState(false);
  const [playerStatus, setPlayerStatus] = useState<
    "idle" | "loading" | "readyToPlay" | "error"
  >("idle");

  const player = useVideoPlayer(videoUrl ?? "", (playerInstance) => {
    if (playerInstance) {
      playerInstance.loop = true;
    }
  });

  useEffect(() => {
    if (!player) return;
    const sub = player.addListener("statusChange", ({ status }) => {
      setPlayerStatus(status);
    });
    return () => sub.remove();
  }, [player]);

  const seekTo = useCallback(
    (position: number) => {
      if (!player) return;
      try {
        const duration = player.duration;
        if (!duration || duration <= 0) return;
        player.currentTime = position * duration;
      } catch {}
    },
    [player]
  );

  useEffect(() => {
    if (!player) return;
    if (isPlaying) {
      try { player.play(); } catch {}
    } else {
      try { player.pause(); } catch {}
    }
  }, [isPlaying, player]);

  useEffect(() => {
    if (!player) return;
    try { player.muted = !isPlaying; } catch {}
  }, [player, isPlaying]);

  useEffect(() => {
    if (!player || !videoUrl) return;
    setHasFirstFrame(false);
    setPlayerStatus("idle");
    progress.value = 0;
  }, [post.id]);

  useEffect(() => {
    if (!player || !isPlaying) return;
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
  }, [player, isPlaying]);

  const progressStyle = useAnimatedStyle(() => ({
    width: progress.value * screenWidth,
  }));

  const handleSeek = useCallback(
    (newProgress: number) => {
      progress.value = newProgress;
      seekTo(newProgress);
    },
    [seekTo]
  );

  const progressPan = Gesture.Pan()
    .onUpdate((e) => {
      const newProgress = Math.max(0, Math.min(1, e.x / screenWidth));
      progress.value = newProgress;
    })
    .onEnd(() => {
      runOnJS(handleSeek)(progress.value);
    });

  /* SINGLE TAP → toggle play/pause */
  const singleTap = Gesture.Tap()
    .numberOfTaps(1)
    .onEnd(() => {
      if (onTogglePlay) runOnJS(onTogglePlay)();
    });

  /* DOUBLE TAP → like only (never unlike) + heart animation */
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(250)
    .onEnd((_, success) => {
      if (success) {
        if (onDoubleTapLike) runOnJS(onDoubleTapLike)();
        runOnJS(triggerHeart)();
      }
    });

  const taps = Gesture.Exclusive(doubleTap, singleTap);

  if (!videoUrl) {
    return null;
  }

  return (
    <View width={screenWidth} height={screenHeight} backgroundColor="black">
      <GestureDetector gesture={taps}>
        <View style={StyleSheet.absoluteFill}>
          {player && (
            <VideoView
              player={player}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              nativeControls={false}
              useExoShutter={false}
              pointerEvents="none"
              onFirstFrameRender={() => {
                setHasFirstFrame(true);
                progress.value = 0;
              }}
            />
          )}

          {!hasFirstFrame &&
            (thumbnailUrl ? (
              <Image
                source={thumbnailUrl}
                style={{ position: "absolute", width: "100%", height: "100%" }}
                contentFit="cover"
              />
            ) : (
              <View
                position="absolute"
                width="100%"
                height="100%"
                backgroundColor="black"
              />
            ))}

          {!hasFirstFrame && playerStatus === "loading" && (
            <View
              position="absolute"
              width="100%"
              height="100%"
              justifyContent="center"
              alignItems="center"
              backgroundColor="rgba(0,0,0,0.3)"
              pointerEvents="none"
            >
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
          )}

          {playerStatus === "error" && (
            <View
              position="absolute"
              width="100%"
              height="100%"
              justifyContent="center"
              alignItems="center"
              backgroundColor="rgba(0,0,0,0.6)"
              pointerEvents="none"
            >
              <Play size={28} color={colors.white} />
            </View>
          )}

          {!isPlaying && (
            <View
              width={60}
              height={60}
              borderRadius={30}
              backgroundColor="#FFF1DB"
              position="absolute"
              justifyContent="center"
              alignItems="center"
              alignSelf="center"
              top={screenHeight * 0.45}
              pointerEvents="none"
            >
              <Play size={28} color={colors.black} fill={colors.black} />
            </View>
          )}

          <Animated.View
            style={[
              {
                position: "absolute",
                alignSelf: "center",
                top: screenHeight * 0.4,
              },
              heartStyle,
            ]}
          >
            <Animated.Image
              source={require("@/assets/images/likeIcon2.png")}
              style={{ width: 80, height: 80 }}
            />
          </Animated.View>

          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 200,
              pointerEvents: "none",
            }}
          />
        </View>
      </GestureDetector>

      {/* PROGRESS BAR */}
      <View
        position="absolute"
        bottom={0}
        width={screenWidth}
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
                  { height: "100%", backgroundColor: colors.secondary },
                  progressStyle,
                ]}
              />
            </View>
          </View>
        </GestureDetector>
      </View>
    </View>
  );
}

export default memo(
  VideoPostCardComponent,
  (prev, next) =>
    prev.post.id === next.post.id &&
    prev.isPlaying === next.isPlaying &&
    prev.screenWidth === next.screenWidth &&
    prev.screenHeight === next.screenHeight
);
