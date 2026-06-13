import { PostCard } from "@/components/post/PostCard";
import { usePostActionsStore } from "@/store/usePostActionStore";
import { FeedPost } from "@/types/feedTypes";
import { mergePostState } from "@/utils/post/postState/mergePostState";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, AppState, FlatList, View, ViewToken } from "react-native";
import colors from "@/constants/colors";

type Props = {
  posts: FeedPost[];
  initialIndex?: number;
  containerHeight: number;
  containerWidth: number;
  tabBarHeight: number;
  isScreenFocused?: boolean;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
};

function PostViewerEngineComponent({
  posts,
  initialIndex = 0,
  containerHeight,
  containerWidth,
  tabBarHeight,
  isScreenFocused,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  refreshing,
  onRefresh,
}: Props) {
  const flatListRef = useRef<FlatList<FeedPost>>(null);

  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [pausedPostId, setPausedPostId] = useState<string | null>(null);

  const likedMap = usePostActionsStore((s) => s.likedPosts);
  const savedMap = usePostActionsStore((s) => s.savedPosts);
  const followedMap = usePostActionsStore((s) => s.followedUsers);

  const origLength = posts?.length || 0;
  const startIndex = origLength + (initialIndex ?? 0);

  const mergedPosts = useMemo(() => {
    if (!posts?.length) return [];
    const base = posts.map((p) =>
      mergePostState(p, {
        likedPosts: likedMap,
        savedPosts: savedMap,
        followedUsers: followedMap,
      }),
    );
    // Triple the array for endless looping
    return [...base, ...base, ...base];
  }, [posts]);

  const extraData = useMemo(() => ({
    activePostId,
    pausedPostId,
  }), [activePostId, pausedPostId]);

  // Scroll to middle copy when FlatList mounts or posts length changes
  useEffect(() => {
    if (!containerHeight || mergedPosts.length === 0) return;
    const id = requestAnimationFrame(() => {
      flatListRef.current?.scrollToIndex({ index: startIndex, animated: false });
      setActivePostId(mergedPosts[startIndex]?.id ?? null);
    });
    return () => cancelAnimationFrame(id);
  }, [containerHeight, mergedPosts.length, startIndex]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        setActivePostId(null);
        setPausedPostId(null);
      }
    });
    return () => sub.remove();
  }, []);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 150,
  }).current;

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (!viewableItems?.length) return;
      const current = viewableItems[0]?.item;
      if (!current?.id) return;
      setActivePostId(current.id);
      setPausedPostId(null);
    },
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: FeedPost }) => {
      const itemId = item?.id ?? "";
      const isActive = itemId === (activePostId ?? "");
      const isPaused = itemId === (pausedPostId ?? "");
      const shouldPlay = !!(isScreenFocused && isActive && !isPaused);

      return (
        <PostCard
          key={itemId}
          post={item}
          isPlaying={shouldPlay}
          isActive={isActive ?? false}
          onTogglePlay={() => {
            setPausedPostId((prev) => (prev === itemId ? null : itemId));
          }}
          screenHeight={containerHeight}
          screenWidth={containerWidth}
          tabBarHeight={tabBarHeight}
        />
      );
    },
    [activePostId, pausedPostId, containerHeight, containerWidth, tabBarHeight, isScreenFocused],
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: containerHeight || 1,
      offset: (containerHeight || 1) * index,
      index,
    }),
    [containerHeight],
  );

  const onMomentumScrollEnd = useCallback((e: any) => {
    if (!origLength) return;
    const offsetY = e.nativeEvent.contentOffset.y;
    const currentIndex = Math.round(offsetY / containerHeight);

    if (currentIndex >= origLength * 2) {
      // Past the end of the middle copy → jump back to middle
      const target = currentIndex - origLength;
      flatListRef.current?.scrollToIndex({ index: target, animated: false });
      // Fetch next page on loop
      if (hasNextPage && !isFetchingNextPage && fetchNextPage) {
        fetchNextPage();
      }
    } else if (currentIndex < origLength) {
      // Past the beginning of the middle copy → jump forward to middle
      const target = currentIndex + origLength;
      flatListRef.current?.scrollToIndex({ index: target, animated: false });
    }
  }, [origLength, containerHeight, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const keyExtractor = useCallback((item: FeedPost) => item.id, []);

  if (!containerHeight || !mergedPosts.length) {
    return null;
  }

  return (
    <>
      <FlatList
        ref={flatListRef}
        data={mergedPosts}
        initialScrollIndex={startIndex}
        extraData={extraData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        snapToInterval={containerHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        windowSize={5}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        updateCellsBatchingPeriod={100}
        getItemLayout={getItemLayout}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        onMomentumScrollEnd={onMomentumScrollEnd}
        showsVerticalScrollIndicator={false}
        scrollsToTop={false}
        scrollEventThrottle={16}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListFooterComponent={isFetchingNextPage ? (
          <View style={{ height: 60, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : null}
      />
    </>
  );
}

export const PostViewerEngine = memo(PostViewerEngineComponent);
