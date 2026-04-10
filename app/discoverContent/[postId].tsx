import { PostCard } from "@/components/post/PostCard";
import colors from "@/constants/colors";
import { FeedPost } from "@/types/feedTypes";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, AppState, FlatList, ViewToken } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "tamagui";

import { preloadPostMedia } from "@/helpers/preloadMedia";
import { useDiscoverFeed } from "@/hooks/useDiscover";
import { useResponsive } from "@/hooks/useResponsive";

export default function PostViewerScreen() {
  const tabBarHeight = 0;

  const { postId, categoryId, filter, index } = useLocalSearchParams<{
    postId: string;
    categoryId: string;
    filter?: "all" | "images" | "video" | "text";
    index?: string;
  }>();

  const { posts, isLoading } = useDiscoverFeed(categoryId);

  const flatListRef = useRef<FlatList>(null);

  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [pausedPostId, setPausedPostId] = useState<string | null>(null);

  const { viewportHeight, viewportWidth } = useResponsive();

  const hasScrolledRef = useRef(false);

  /* ================= FILTER ================= */

  const filteredPosts = posts.filter((post: FeedPost) => {
    if (filter === "images") {
      return post.type === "media" && post.media?.[0]?.type === "image";
    }

    if (filter === "video") {
      return post.type === "media" && post.media?.[0]?.type === "video";
    }

    if (filter === "text") {
      return post.type === "text" || post.type === "bible";
    }

    return true;
  });

  /* ================= RESET ================= */

  useEffect(() => {
    hasScrolledRef.current = false;
  }, [postId]);

  /* ================= INITIAL SCROLL (INDEX-BASED) ================= */

  useEffect(() => {
    if (hasScrolledRef.current) return;
    if (!filteredPosts.length) return;
    if (!viewportHeight) return;

    const initialIndex = Number(index ?? 0);

    if (initialIndex < 0 || initialIndex >= filteredPosts.length) {
      console.warn("Invalid index passed to PostViewer:", index);
      return;
    }

    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({
        offset: initialIndex * viewportHeight,
        animated: false,
      });

      setActivePostId(filteredPosts[initialIndex]?.id ?? null);
      hasScrolledRef.current = true;
    });
  }, [filteredPosts, index, viewportHeight]);

  /* ================= FOCUS ================= */

  useFocusEffect(
    useCallback(() => {
      return () => {
        setActivePostId(null);
      };
    }, []),
  );

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        setActivePostId(null);
      }
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

      const index = filteredPosts.findIndex((p) => p.id === current.id);

      if (index >= 0) {
        if (filteredPosts[index + 1]) {
          preloadPostMedia(filteredPosts[index + 1] as any);
        }
        if (filteredPosts[index - 1]) {
          preloadPostMedia(filteredPosts[index - 1] as any);
        }
      }
    },
  ).current;

  /* ================= RENDER ================= */

  const renderItem = useCallback(
    ({ item }: { item: FeedPost }) => (
      <PostCard
        post={item}
        liked={item.viewerState.liked}
        isPlaying={item.id === activePostId && item.id !== pausedPostId}
        onTogglePlay={() => {
          setPausedPostId((prev) => (prev === item.id ? null : item.id));
        }}
        screenHeight={viewportHeight}
        screenWidth={viewportWidth}
        tabBarHeight={tabBarHeight}
      />
    ),
    [activePostId, pausedPostId, viewportHeight, viewportWidth],
  );

  if (isLoading || !filteredPosts.length) {
    return (
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          data={filteredPosts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingBottom: viewportHeight * 0.07, 
          }}
          pagingEnabled
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          snapToInterval={viewportHeight}
          snapToAlignment="start"
          getItemLayout={(_, i) => ({
            length: viewportHeight,
            offset: viewportHeight * i,
            index: i,
          })}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          windowSize={3}
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          removeClippedSubviews
        />
      </View>
    </SafeAreaView>
  );
}
