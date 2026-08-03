import React, { memo, useCallback, useState } from "react";
import { Image } from "expo-image";
import { FlatList, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View, XStack, YStack } from "tamagui";
import { SimpleButton } from "@/components/ui/centerTextButton";
import colors from "@/constants/colors";
import { useJoinCircle } from "@/hooks/useCircles";
import { useAuthStore } from "@/store/useAuthStore";
import { FeedCirclePromo } from "@/types/feedTypes";
import { router } from "expo-router";

type PromotedCircle = FeedCirclePromo["circles"][number];

type Props = {
  item: FeedCirclePromo;
  screenHeight: number;
  screenWidth: number;
  tabBarHeight: number;
};

type CarouselItemProps = {
  circle: PromotedCircle;
  cardWidth: number;
  cardHeight: number;
  imageSize: number;
};

const CirclePromoCarouselItem = memo(function CirclePromoCarouselItem({
  circle,
  cardWidth,
  cardHeight,
  imageSize,
}: CarouselItemProps) {
  const joinCircle = useJoinCircle();
  const [joining, setJoining] = useState(false);
  const [joinedLocally, setJoinedLocally] = useState(false);

  const isJoined = circle.isJoined || joinedLocally;
  const avatarSize = 30;

  const handleJoin = useCallback(async () => {
    const isAuth = useAuthStore.getState().isAuthenticated;
    if (!isAuth) {
      router.push("/(auth)/login/");
      return;
    }
    if (isJoined || joining) return;
    setJoining(true);
    try {
      await joinCircle.mutateAsync(circle.id);
      setJoinedLocally(true);
    } catch (err) {
      console.error("Failed to join circle:", err);
    } finally {
      setJoining(false);
    }
  }, [circle.id, isJoined, joining, joinCircle]);

  const handleOpenCircle = useCallback(() => {
    router.push({
      pathname: "/(tabs)/circle/circleFeed",
      params: {
        id: circle.id,
        source: "suggestion",
        _name: circle.name,
        _desc: circle.description,
        _image: circle.coverImage,
        _members: String(circle.memberCount),
        _avatars: JSON.stringify(circle.avatars ?? []),
      },
    });
  }, [circle]);

  return (
    <Pressable
      onPress={handleOpenCircle}
      style={[styles.card, { width: cardWidth, height: cardHeight }]}
    >
      <YStack flex={1} alignItems="center" justifyContent="center" paddingVertical={16}>
        <View style={[styles.imageWrapper, { width: imageSize, height: imageSize }]}>
          <Image
            source={{ uri: circle.coverImage }}
            style={styles.circleImage}
            contentFit="cover"
            transition={200}
          />
        </View>

        <Text style={[styles.title, { marginTop: 18 }]}>{circle.name}</Text>

        <Text style={styles.description} numberOfLines={3}>
          {circle.description}
        </Text>

        <XStack alignItems="center" justifyContent="center" marginTop={14}>
          {(circle.avatars ?? []).slice(0, 3).map((avatar, index) =>
            avatar ? (
              <Image
                key={index}
                source={{ uri: avatar }}
                style={[
                  styles.avatar,
                  { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
                  { marginLeft: index === 0 ? 0 : -avatarSize * 0.24 },
                ]}
              />
            ) : (
              <View
                key={index}
                style={[
                  styles.avatar,
                  {
                    width: avatarSize,
                    height: avatarSize,
                    borderRadius: avatarSize / 2,
                    backgroundColor: "#7A2E8A",
                  },
                  { marginLeft: index === 0 ? 0 : -avatarSize * 0.24 },
                ]}
              />
            ),
          )}

          <Text style={styles.memberText}>+{circle.memberCount} members</Text>
        </XStack>

        <View style={{ height: 14 }} />

        {isJoined ? (
          <Text style={styles.joinedText}>You&apos;re a member</Text>
        ) : (
          <SimpleButton
            text={joining ? "Joining..." : "Join"}
            onPress={handleJoin}
            loading={joining}
            textSize={15}
            fontFamily="$body"
            fontWeight="600"
            color={colors.primary}
            textColor={colors.white}
            borderRadius={99}
            paddingVertical={8}
            paddingHorizontal={32}
          />
        )}

        <View style={{ height: 4 }} />

        <Text style={styles.tapHint}>Tap to view circle</Text>
      </YStack>
    </Pressable>
  );
});

const CirclePromoCard = memo(function CirclePromoCard({
  item,
  screenHeight,
  screenWidth,
  tabBarHeight,
}: Props) {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);

  const cardWidth = screenWidth * 0.86;
  const gap = screenWidth * 0.04;
  const sidePadding = (screenWidth - cardWidth) / 2;
  const imageSize = Math.min(screenWidth * 0.4, screenHeight * 0.15);
  const cardHeight = 274 + imageSize;
  const paddingBottom = tabBarHeight + insets.bottom + 16;
  const contentTop = Math.max(
    insets.top + 16,
    screenHeight - (70 + 16 + cardHeight + 18 + 8 + paddingBottom),
  );

  const circles = item.circles ?? [];

  const renderItem = useCallback(
    ({ item: circle }: { item: PromotedCircle }) => (
      <CirclePromoCarouselItem
        circle={circle}
        cardWidth={cardWidth}
        cardHeight={cardHeight}
        imageSize={imageSize}
      />
    ),
    [cardWidth, cardHeight, imageSize],
  );

  const onMomentumEnd = useCallback((e: any) => {
    const offsetX = e.nativeEvent.contentOffset?.x ?? 0;
    const index = Math.round(offsetX / (cardWidth + gap));
    setActiveIndex(Math.max(0, index));
  }, [cardWidth, gap]);

  return (
    <YStack
      height={screenHeight}
      width="100%"
      backgroundColor="#FBE0A9"
      paddingTop={contentTop}
      paddingBottom={paddingBottom}
    >
      <YStack alignItems="center">
        <Text style={styles.heading}>JOIN A CIRCLE</Text>
        <Text style={styles.subHeading}>Find your tribe; Be part of a community</Text>
      </YStack>

      <View style={{ height: 16 }} />

      <FlatList
        horizontal
        pagingEnabled
        decelerationRate="fast"
        snapToInterval={cardWidth + gap}
        showsHorizontalScrollIndicator={false}
        data={circles}
        keyExtractor={(circle) => circle.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: sidePadding }}
        style={{ height: cardHeight }}
        onMomentumScrollEnd={onMomentumEnd}
        bounces={false}
      />

      <View style={{ height: 18 }} />

      {circles.length > 1 && (
        <XStack justifyContent="center" alignItems="center">
          {circles.map((circle, index) => (
            <View
              key={circle.id}
              style={[
                styles.dot,
                { backgroundColor: index === activeIndex ? "#7C5004" : "#DDB56E" },
              ]}
            />
          ))}
        </XStack>
      )}
    </YStack>
  );
});

export default CirclePromoCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#DDB56E",
    borderRadius: 30,
    marginRight: 16,
    paddingHorizontal: 20,
    overflow: "hidden",
  },

  imageWrapper: {
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#C9A25A",
  },

  circleImage: {
    width: "100%",
    height: "100%",
  },

  title: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
    fontFamily: "$heading",
  },

  description: {
    marginTop: 12,
    height: 72,
    fontSize: 15,
    color: "#6D4B16",
    lineHeight: 24,
    textAlign: "center",
    fontFamily: "$body",
  },

  avatar: {
    borderWidth: 2,
    borderColor: "#DDB56E",
  },

  memberText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "600",
    color: "#3A2C10",
    fontFamily: "$body",
  },

  joinedText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4A3B12",
    fontFamily: "$body",
  },

  tapHint: {
    fontSize: 12,
    color: "#6D4B16",
    opacity: 0.7,
    fontFamily: "$body",
  },

  heading: {
    fontSize: 30,
    fontWeight: "800",
    color: "#191621",
    letterSpacing: 0.5,
    fontFamily: "$body",
  },

  subHeading: {
    marginTop: 10,
    fontSize: 18,
    color: "#2E2A35",
    textAlign: "center",
    fontFamily: "$body",
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});
