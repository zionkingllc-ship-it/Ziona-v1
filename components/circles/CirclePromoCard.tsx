import React, { memo, useCallback, useState } from "react";
import { Image } from "expo-image";
import { FlatList, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View, XStack, YStack } from "tamagui";
import { SimpleButton } from "@/components/ui/centerTextButton";
import { AvatarWithInitials } from "@/components/ui/AvatarWithInitials";
import colors from "@/constants/colors";
import { useJoinCircle } from "@/hooks/useCircles";
import { useRequireAuth } from "@/hooks/useRequireAuth";
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
  scale: number;
};

const CirclePromoCarouselItem = memo(function CirclePromoCarouselItem({
  circle,
  cardWidth,
  cardHeight,
  imageSize,
  scale,
}: CarouselItemProps) {
  const joinCircle = useJoinCircle();
  const { requireAuth, AuthModal } = useRequireAuth(
    "Please login to join this circle.",
  );
  const [joining, setJoining] = useState(false);
  const [joinedLocally, setJoinedLocally] = useState(false);
  const [failedUris, setFailedUris] = useState<string[]>([]);

  const isJoined = circle.isJoined || joinedLocally;
  const avatarSize = 30 * scale;

  const doJoin = useCallback(async () => {
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

  const handleJoin = useCallback(() => {
    requireAuth(doJoin);
  }, [requireAuth, doJoin]);

  const handleOpenCircle = useCallback(() => {
    router.push({
      pathname: "/circleFeed",
      params: {
        id: circle.id,
        source: "suggestion",
        _name: circle.name,
        _desc: circle.description,
        _image: circle.coverImage,
        _members: String(circle.memberCount),
        _avatars: JSON.stringify(
          (circle.members?.length ? circle.members : (circle.avatars ?? []).map((av) => ({ avatarUrl: av }))).map(
            (m) => m.avatarUrl ?? "",
          ),
        ),
      },
    });
  }, [circle]);

  return (
    <>
      {AuthModal}
      <Pressable
        onPress={handleOpenCircle}
        style={[
          styles.card,
          { width: cardWidth, height: cardHeight, paddingTop: 16 * scale, paddingBottom: 16 * scale },
        ]}
      >
        <YStack flex={1} alignItems="center" justifyContent="center">
          <View style={[styles.imageWrapper, { width: imageSize, height: imageSize }]}>
            <Image
              source={{ uri: circle.coverImage }}
              style={styles.circleImage}
              contentFit="cover"
              transition={200}
            />
          </View>

          <Text numberOfLines={1} style={[styles.title, { marginTop: 18 * scale, fontSize: 24 * scale }]}>
            {circle.name}
          </Text>

          <Text
            numberOfLines={3}
            style={[
              styles.description,
              { marginTop: 12 * scale, height: 72 * scale, fontSize: 15 * scale, lineHeight: 24 * scale },
            ]}
          >
            {circle.description}
          </Text>

          <XStack alignItems="center" justifyContent="center" marginTop={14 * scale}>
            {(circle.members?.length ? circle.members : (circle.avatars ?? []).map((av) => ({ id: "", name: "", avatarUrl: av })) )
              .slice(0, 4)
              .map((member, index) => (
                <AvatarWithInitials
                  key={`${member.id || member.avatarUrl}-${index}`}
                  uri={member.avatarUrl}
                  name={member.name}
                  size={avatarSize}
                  failedUris={failedUris}
                  setFailedUris={setFailedUris}
                  style={[
                    styles.avatar,
                    { marginLeft: index === 0 ? 0 : -avatarSize * 0.24 },
                  ]}
                />
              ))}

            <Text style={[styles.memberText, { fontSize: 15 * scale, marginLeft: 12 * scale }]}>
              +{circle.memberCount} members
            </Text>
          </XStack>

          <View style={{ height: 14 * scale }} />

          {isJoined ? (
            <Text style={[styles.joinedText, { fontSize: 15 * scale }]}>You&apos;re a member</Text>
          ) : (
            <SimpleButton
              text={joining ? "Joining..." : "Join"}
              onPress={handleJoin}
              loading={joining}
              textSize={15 * scale}
              fontFamily="$body"
              fontWeight="600"
              color={colors.primary}
              textColor={colors.white}
              borderRadius={99}
              paddingVertical={8 * scale}
              paddingHorizontal={32 * scale}
            />
          )}

          <View style={{ height: 4 * scale }} />

          <Text style={[styles.tapHint, { fontSize: 12 * scale }]}>Tap to view circle</Text>
        </YStack>
      </Pressable>
    </>
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

  const scale = Math.max(0.85, Math.min(screenHeight / 700, 1.2));
  const cardWidth = screenWidth * 0.86;
  const gap = screenWidth * 0.04;
  const sidePadding = (screenWidth - cardWidth) / 2;
  const imageSize = Math.min(screenWidth * 0.4, screenHeight * 0.16);
  const cardHeight = Math.min(screenHeight * 0.58, imageSize + 320 * scale);
  const paddingBottom = tabBarHeight + insets.bottom + 12;
  const paddingTop = insets.top + 12;

  const circles = item.circles ?? [];

  const renderItem = useCallback(
    ({ item: circle }: { item: PromotedCircle }) => (
      <CirclePromoCarouselItem
        circle={circle}
        cardWidth={cardWidth}
        cardHeight={cardHeight}
        imageSize={imageSize}
        scale={scale}
      />
    ),
    [cardWidth, cardHeight, imageSize, scale],
  );

  const onMomentumEnd = useCallback((e: any) => {
    const offsetX = e.nativeEvent.contentOffset?.x ?? 0;
    const index = Math.round(offsetX / (cardWidth + gap));
    setActiveIndex(Math.max(0, index));
  }, [cardWidth, gap]);

  return (
    <YStack height={screenHeight} width="100%" overflow="hidden">
      <View
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        backgroundColor="#FBE0A9"
      />

      <YStack flex={1} paddingTop={paddingTop} paddingBottom={paddingBottom} justifyContent="center">
        <YStack marginTop={120}>
          <YStack alignItems="center">
            <Text style={[styles.heading, { fontSize: 30 * scale }]}>JOIN A CIRCLE</Text>
            <Text style={[styles.subHeading, { fontSize: 18 * scale }]}>
              Find your tribe; Be part of a community
            </Text>
          </YStack>

          <View style={{ height: 16 * scale }} />

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

          <View style={{ height: 18 * scale }} />

          {circles.length > 1 && (
            <XStack justifyContent="center" alignItems="center">
              {circles.map((circle, index) => (
                <View
                  key={circle.id}
                  style={[
                    styles.dot,
                    {
                      width: 8 * scale,
                      height: 8 * scale,
                      borderRadius: 4 * scale,
                      marginHorizontal: 4 * scale,
                      backgroundColor: index === activeIndex ? "#7C5004" : "#DDB56E",
                    },
                  ]}
                />
              ))}
            </XStack>
          )}
        </YStack>
      </YStack>
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
