import { FeedBiblePost, FeedTextPost } from "@/types/feedTypes";
import React from "react";
import { YStack } from "tamagui";

import { useResponsive } from "@/hooks/useResponsive";
import { Category } from "@/types/category";
import TextPostCardOutput from "./TextPostCardOutput";

import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import colors from "@/constants/colors";

type Props = {
  post: FeedTextPost | FeedBiblePost;
  onLike?: () => void;
};

export default function TextPostCard({ post, onLike }: Props) {
  const { wp, hp } = useResponsive();

  /* ================= SAFE DATA ================= */

  const category = post.category;

  let scriptureText: string | undefined;
  let translation: string | undefined;
  let verseText: string | undefined;
  let testimonyText: string | undefined;

  if (post.scripture) {
    const s = post.scripture;
    scriptureText = `${s.book} ${s.chapter}:${s.verseStart}${
      s.verseEnd ? `-${s.verseEnd}` : ""
    }`;
    translation = s.translation;
    verseText = s.text;
  }

  if (post.type === "text") {
    testimonyText = post.textMessage;
  }

  /* ================= HEART ANIMATION ================= */

  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartOpacity.value,
  }));

  const triggerHeart = () => {
    heartScale.value = 0;
    heartOpacity.value = 1;

    heartScale.value = withTiming(1.2, { duration: 180 }, () => {
      heartScale.value = withTiming(1, { duration: 100 }, () => {
        heartScale.value = withTiming(0, { duration: 200 });
        heartOpacity.value = withTiming(0, { duration: 200 });
      });
    });
  };

  /* ================= GESTURE ================= */

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(250)
    .onEnd((_, success) => {
      if (success) {
        if (onLike) runOnJS(onLike)();
        runOnJS(triggerHeart)();
      }
    });

  const likeIconActive = require("@/assets/images/likeIcon2.png");

  /* ================= RENDER ================= */

  return (
    <GestureDetector gesture={doubleTap}>
      <Animated.View style={{ flex: 1, backgroundColor: category?.textPostBg ? category?.textPostBg : "#270C1F"}}>
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          paddingHorizontal={wp(6)}
          paddingVertical={hp(16)}
        >
          <TextPostCardOutput
            category={category as Category}
            scripture={scriptureText}
            translation={translation}
            verseText={verseText}
            testimonyText={testimonyText}
          />
        </YStack>

        {/* HEART ANIMATION */}
        <Animated.View
          style={[
            {
              position: "absolute",
              alignSelf: "center",
              top: hp(40),
            }, 
            heartStyle,
          ]}
        >
          <Animated.Image
            source={likeIconActive}
            style={{ width: 80, height: 80 }}
          />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}
