import { PostCard } from "@/components/post/PostCard";
import { FeedPost } from "@/types/feedTypes";
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

  const origLength = posts?.length || 0;

  const mergedPosts = useMemo(() => {
    if (!posts?.length) return [];
    // Triple the array for endless looping
    const tripled = [...posts, ...posts, ...posts];
    // Safety: deduplicate when all items are the same post (e.g. single-post sources)
    const uniqueIds = new Set(tripled.map((p) => p.id));
    if (uniqueIds.size === 1 && tripled.length > 1) {
      return posts;
    }
    return tripled;
  }, [posts]);

  // When mergedPosts is deduplicated to a single item, start at 0
  const startIndex = mergedPosts.length <= 1 ? 0 : origLength + (initialIndex ?? 0);

  const extraData = useMemo(() => ({
    activePostId,
    pausedPostId,
    isScreenFocused,
  }), [activePostId, pausedPostId, isScreenFocused]);

  // Scroll to correct position when FlatList first mounts (onLayout fires after layout).
  const hasScrolled = useRef(false);
  const safeIndex = Math.min(startIndex, mergedPosts.length - 1);
  const handleInitialScroll = useCallback(() => {
    if (hasScrolled.current) return;
    hasScrolled.current = true;
    flatListRef.current?.scrollToIndex({ index: safeIndex, animated: false });
    setActivePostId(mergedPosts[safeIndex] ? `${mergedPosts[safeIndex].id}-${safeIndex}` : null);
  }, [safeIndex, mergedPosts]);

  // Re-scroll when initialIndex changes (viewer navigating between posts).
  useEffect(() => {
    if (!containerHeight) return;
    flatListRef.current?.scrollToIndex({ index: safeIndex, animated: false });
    setActivePostId(mergedPosts[safeIndex] ? `${mergedPosts[safeIndex].id}-${safeIndex}` : null);
  }, [initialIndex, containerHeight]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        setActivePostId(null);
        setPausedPostId(null);
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!isScreenFocused) {
      setActivePostId(null);
    }
  }, [isScreenFocused]);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 150,
  }).current;

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (!viewableItems?.length) {
        setActivePostId(null);
        return;
      }
      const current = viewableItems[0]?.item;
      const currentIndex = viewableItems[0]?.index;
      if (!current?.id || currentIndex == null) {
        setActivePostId(null);
        return;
      }
      setActivePostId(`${current.id}-${currentIndex}`);
      setPausedPostId(null);
    },
    [],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: FeedPost; index: number }) => {
      const itemKey = `${item?.id ?? ""}-${index}`;
      const isActive = itemKey === (activePostId ?? "");
      const isPaused = itemKey === (pausedPostId ?? "");
      const shouldPlay = !!(isScreenFocused && isActive && !isPaused);

      return (
        <PostCard
          key={itemKey}
          post={item}
          isPlaying={shouldPlay}
          isActive={isActive ?? false}
          onTogglePlay={() => {
            setPausedPostId((prev) => (prev === itemKey ? null : itemKey));
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

  const keyExtractor = useCallback((item: FeedPost, index: number) => `${item.id}-${index}`, []);

  if (!containerHeight || !mergedPosts.length) {
    return null;
  }

  return (
    <>
      <FlatList
        ref={flatListRef}
        data={mergedPosts}
        extraData={extraData}
        onLayout={handleInitialScroll}
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
        onScrollToIndexFailed={(info) => {
          flatListRef.current?.scrollToOffset({
            offset: containerHeight * info.index,
            animated: false,
          });
        }}
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
