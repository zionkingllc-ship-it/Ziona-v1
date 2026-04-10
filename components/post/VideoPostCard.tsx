import { FeedMediaPost } from "@/types/feedTypes";
import React, { useEffect, useRef } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { Video, ResizeMode } from "expo-av";
import { View } from "tamagui";
import { Play } from "@tamagui/lucide-icons";
import colors from "@/constants/colors";

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
  const videoRef = useRef<Video>(null);
  const progress = useSharedValue(0);

  const videoUrl = post.media?.[0]?.url;
  if (!videoUrl) return null;

  /* PLAYBACK */
  useEffect(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.playAsync();
    } else {
      videoRef.current.pauseAsync();
    }
  }, [isPlaying]);

  /* PROGRESS */
  const onStatusUpdate = (status: any) => {
    if (!status.isLoaded) return;

    if (status.positionMillis && status.durationMillis) {
      progress.value =
        status.positionMillis / status.durationMillis;
    }
  };

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
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={{ width: "100%", height: "100%" }}
          resizeMode={ResizeMode.COVER}
          isLooping
          shouldPlay={false}
          onPlaybackStatusUpdate={onStatusUpdate}
        />

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
              },
              progressStyle,
            ]}
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
    prev.isPlaying === next.isPlaying
);