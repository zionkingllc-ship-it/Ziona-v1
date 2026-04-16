import { FeedMediaPost } from "@/types/feedTypes";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
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

type VideoPost = Extract<FeedMediaPost, { mediaType: "video" }>;

interface Props {
  post: VideoPost;
  isPlaying: boolean;
  onTogglePlay?: () => void;
  onLike?: () => void;
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
  heartStyle,
  triggerHeart,
  screenWidth,
  screenHeight,
}: Props) {
  const videoUrl = post.media?.[0]?.url;
  const thumbnailUrl = post.media?.[0]?.thumbnailUrl;

  if (!videoUrl) return null;

  const progress = useSharedValue(0);
  const [hasFirstFrame, setHasFirstFrame] = useState(false);

  const player = useVideoPlayer(videoUrl, (playerInstance) => {
    playerInstance.loop = true;
  });

  /* PLAYBACK */
  useEffect(() => {
    if (!player) return;

    if (isPlaying) {
      player.play();
    } else {
      player.pause();
    }
  }, [isPlaying, player]);

  useEffect(() => {
    setHasFirstFrame(false);
    progress.value = 0;
  }, [post.id, progress]);

  /* PROGRESS */
  useEffect(() => {
    if (!player) return;

    try {
      player.timeUpdateEventInterval = 0.25;

      const subscription = player.addListener("timeUpdate", ({ currentTime }) => {
        const duration = player.duration;
        if (duration > 0) {
          progress.value = currentTime / duration;
        }
      });

      return () => {
        subscription.remove();
      };
    } catch {
      // Ignore progress listener errors
    }
  }, [player, progress]);

  const progressStyle = useAnimatedStyle(() => ({
    width: progress.value * screenWidth,
  }));

  /* GESTURES */
/* GESTURES (FIXED) */

const singleTap = Gesture.Tap()
  .maxDuration(250)
  .onStart(() => {
    if (onTogglePlay) runOnJS(onTogglePlay)();
  });

const doubleTap = Gesture.Tap()
  .numberOfTaps(2)
  .maxDelay(250)
  .onEnd(() => {
    if (onLike) runOnJS(onLike)();
    runOnJS(triggerHeart)();
  });

const gesture = Gesture.Exclusive(doubleTap, singleTap);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={{
          width: screenWidth,
          height: screenHeight,
          backgroundColor: "black",
        }}
      >
        {player && (
          <VideoView
            player={player}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            nativeControls={false}
            useExoShutter={false}
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
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
              }}
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

        {/* PLAY BUTTON */}
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
            <Play size={28} color={colors.black} fill={colors.black}/>
          </View>
        )}

        {/* HEART */}
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

        {/* PROGRESS BAR */}
        <Animated.View
          style={{
            position: "absolute",
            bottom: 0,
            width: screenWidth,
            height: 6,
            backgroundColor: "rgba(255,255,255,0.3)",
          }}
        >
          <Animated.View
            style={[
              {
                height: "100%",
                backgroundColor: colors.secondary,
                zIndex: 1,
              },
              progressStyle,
            ]}
          />
          
                {/* GRADIENT OVERLAY FOR TEXT VISIBILITY */}
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.7)"]}
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 200,
                  }}
                />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

export default React.memo(
  VideoPostCardComponent,
  (prev, next) =>
    prev.post.id === next.post.id &&
    prev.isPlaying === next.isPlaying &&
    prev.screenWidth === next.screenWidth &&
    prev.screenHeight === next.screenHeight
);
