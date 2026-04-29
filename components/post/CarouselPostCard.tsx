import colors from "@/constants/colors";
import { FeedMediaPost } from "@/types/feedTypes";
import { LinearGradient } from "expo-linear-gradient";
import React, { memo, useRef, useState } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS } from "react-native-reanimated";
import { Image, View } from "tamagui";

interface Props {
  post: FeedMediaPost;
  onLike?: () => void;
  heartStyle?: any;
  triggerHeart?: () => void;
  screenWidth: number;
  screenHeight: number;
}

function CarouselPostCardComponent({
  post,
  screenWidth = 400,
  screenHeight = 800,
  onLike,
  triggerHeart,
}: Props) {
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const mediaItems = (post?.media ?? []).filter(
    (item) => item?.type === "image" && item?.url,
  );

  if (!mediaItems?.length) {
    return (
      <View width={screenWidth} height={screenHeight} backgroundColor="black" />
    );
  }

  const handleLike = () => {
    if (onLike) onLike();
    if (triggerHeart) triggerHeart();
  };

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      runOnJS(handleLike)();
    });

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
    setActiveIndex(index);
  };

  const renderImage = ({ item }: { item: any }) => (
    <Image
      source={{ uri: item.url }}
      width={screenWidth}
      height={screenHeight}
      resizeMode="contain"
    />
  );

  return (
    <GestureDetector gesture={doubleTap}>
      <View width={screenWidth} height={screenHeight} backgroundColor="black">
        <FlatList
          ref={flatListRef}
          data={mediaItems}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => index.toString()}
          onMomentumScrollEnd={onScrollEnd}
          renderItem={renderImage}
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
        />
        {mediaItems.length > 1 && (
          <View
            position="absolute"
            bottom={20}
            alignSelf="center"
            flexDirection="row"
            gap={6}
          >
            {mediaItems.map((_, i) => (
              <View
                key={i}
                width={activeIndex === i ? 8 : 6}
                height={activeIndex === i ? 8 : 6}
                borderRadius={4}
                backgroundColor={
                  activeIndex === i ? colors.white : "rgba(255,255,255,0.5)"
                }
              />
            ))}
          </View>
        )}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.3)"]}
          style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 100 }}
        />
      </View>
    </GestureDetector>
  );
}

export default memo(CarouselPostCardComponent, (prev, next) =>
  prev.post.id === next.post.id &&
  prev.screenWidth === next.screenWidth &&
  prev.screenHeight === next.screenHeight
);