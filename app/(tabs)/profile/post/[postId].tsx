import { PostCard } from "@/components/post/PostCard";
import colors from "@/constants/colors";
import { preloadPostMedia } from "@/helpers/preloadMedia";
import { useUserPosts } from "@/hooks/useUserPost";
import { FeedPost } from "@/types/feedTypes";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, AppState, FlatList, ViewToken } from "react-native";
import { View } from "tamagui";
import { SnapListContainer } from "@/components/layout/SnapListContainer";
import { FlatListProps } from "react-native";
 
export default function ProfilePostViewerScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const tabBarHeight = useBottomTabBarHeight();

  const { posts, isLoading } = useUserPosts();

  const flatListRef = useRef<FlatList<FeedPost>>(null);

  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [pausedPostId, setPausedPostId] = useState<string | null>(null);

  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const hasScrolledRef = useRef(false);

  /* ================= INITIAL SCROLL ================= */

  useEffect(() => {
    if (hasScrolledRef.current) return;
    if (!posts.length) return;
    if (!containerHeight) return;

    const index = posts.findIndex((p) => p.id === postId);
    if (index < 0) return;

    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({
        offset: index * containerHeight,
        animated: false,
      });

      setActivePostId(posts[index]?.id ?? null);
      hasScrolledRef.current = true;
    });
  }, [posts, postId, containerHeight]);

  /* ================= FOCUS ================= */

  useFocusEffect(
    useCallback(() => {
      return () => setActivePostId(null);
    }, []),
  );

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") setActivePostId(null);
    });

    return () => sub.remove();
  }, []);

  /* ================= VIEWABILITY ================= */

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
    minimumViewTime: 200,
  }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (!viewableItems.length) return;

      setPausedPostId(null);

      const current = viewableItems[0].item;
      if (!current?.id) return;

      setActivePostId(current.id);

      const index = posts.findIndex((p) => p.id === current.id);

      if (index >= 0) {
        if (posts[index + 1]) preloadPostMedia(posts[index + 1] as any);
        if (posts[index - 1]) preloadPostMedia(posts[index - 1] as any);
      }
    },
  ).current;

  /* ================= LOADING ================= */

  if (isLoading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size={40} color={colors.primary} />
      </View>
    );
  }

  /* ================= MAIN ================= */

  return (
    <SnapListContainer
      flatListRef={flatListRef}
      data={posts}
      keyExtractor={(item) => item.id}
      viewabilityConfig={viewabilityConfig}
      onViewableItemsChanged={onViewableItemsChanged}
      onLayoutReady={({ height, width }) => {
        setContainerHeight(height);
        setContainerWidth(width);
      }}
      renderItem={({ item }) => (
        <PostCard
          post={item}
          liked={item.viewerState.liked}
          isPlaying={item.id === activePostId && item.id !== pausedPostId}
          onTogglePlay={() => {
            setPausedPostId((prev) =>
              prev === item.id ? null : item.id,
            );
          }}
          screenHeight={containerHeight}
          screenWidth={containerWidth}
          tabBarHeight={tabBarHeight}
        />
      )}
    />
  );
}