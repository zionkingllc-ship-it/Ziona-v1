import { FeedMediaPost, FeedPost } from "@/types/feedTypes";
import React from "react";
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
  onTogglePlay?: () => void;
  onLike?: () => void;
  screenWidth: number;
  screenHeight: number;
  tabBarHeight: number;
}

export default function PostMedia({
  post,
  isPlaying,
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

  /* ================= MEDIA ================= */
  if (post.type === "media") {
    const mediaPost = post as FeedMediaPost;
    const firstMedia = mediaPost.media?.[0];

    if (!firstMedia || !firstMedia.url) return null;

    if (firstMedia.type === "image") {
      return (
        <CarouselPostCard
          post={mediaPost}
          onLike={onLike}
          heartStyle={heartStyle}
          triggerHeart={triggerHeart}
          screenWidth={screenWidth}
          screenHeight={screenHeight}
        />
      );
    }

    if (firstMedia.type === "video") {
      return (
        <VideoPostCard
          post={mediaPost}
          isPlaying={isPlaying}
          onTogglePlay={onTogglePlay}
          onLike={onLike}
          heartStyle={heartStyle}
          triggerHeart={triggerHeart}
          screenWidth={screenWidth}
          screenHeight={screenHeight}
          tabBarHeight={tabBarHeight}
        />
      );
    }

    return null;
  }

  /* ================= TEXT / BIBLE ================= */
  if (post.type === "text" || post.type === "bible") {
    return <TextPostCard post={post} onLike={onLike} />;
  }

  return null;
}
