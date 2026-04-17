import { FeedPost } from "@/types/feedTypes";
import React, { memo, useCallback, useMemo } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import CarouselPostCard from "../CarouselPostCard";
import TextPostCard from "../TextPostCard";
import VideoPostCard from "../VideoPostCard";

interface Props {
  post: FeedPost;
  isPlaying: boolean;
  isActive: boolean;
  onTogglePlay?: () => void;
  onLike?: () => void;
  screenWidth: number;
  screenHeight: number;
  tabBarHeight: number;
}

function PostMediaComponent({
  post,
  isPlaying,
  isActive,
  onTogglePlay,
  onLike,
  screenWidth,
  screenHeight,
  tabBarHeight,
}: Props) {
  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartOpacity.value,
  }));

  const triggerHeart = useCallback(() => {
    heartScale.value = 0;
    heartOpacity.value = 1;

    heartScale.value = withTiming(1.2, { duration: 180 }, () => {
      heartScale.value = withTiming(1, { duration: 100 }, () => {
        heartScale.value = withTiming(0, { duration: 200 });
        heartOpacity.value = withTiming(0, { duration: 200 });
      });
    });
  }, []);

  const mediaProps = useMemo(
    () => ({
      screenWidth,
      screenHeight,
      tabBarHeight,
      heartStyle,
      triggerHeart,
    }),
    [screenWidth, screenHeight, tabBarHeight],
  );

  if (post.type === "media" && post.media?.[0]) {
    if (post.mediaType === "video" && post.media[0].url) {
      return (
        <VideoPostCard
          post={post}
          isPlaying={isPlaying}
          onTogglePlay={onTogglePlay}
          onLike={onLike}
          {...mediaProps}
        />
      );
    }

    return (
      <CarouselPostCard post={post} onLike={onLike} {...mediaProps} />
    );
  }

  if (post.type === "text" || post.type === "bible") {
    return <TextPostCard post={post} onLike={onLike} />;
  }

  return null;
}

export default memo(PostMediaComponent, (prev, next) =>
  prev.post.id === next.post.id &&
  prev.isPlaying === next.isPlaying &&
  prev.isActive === next.isActive &&
  prev.screenWidth === next.screenWidth &&
  prev.screenHeight === next.screenHeight
);
