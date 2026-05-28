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
import { AppState, FlatList, ViewToken } from "react-native";

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
  const [isReady, setIsReady] = useState(false);
  const hasInitialized = useRef(false);

  const likedMap = usePostActionsStore((s) => s.likedPosts);
  const savedMap = usePostActionsStore((s) => s.savedPosts);
  const followedMap = usePostActionsStore((s) => s.followedUsers);

  const mergedPosts = useMemo(() => {
    if (!posts?.length) return [];
    return posts.map((p) =>
      mergePostState(p, {
        likedPosts: likedMap,
        savedPosts: savedMap,
        followedUsers: followedMap,
      }),
    );
  }, [posts]);

  const extraData = useMemo(() => ({
    activePostId,
    pausedPostId,
  }), [activePostId, pausedPostId]);

  useEffect(() => {
    if (!hasInitialized.current && mergedPosts.length > 0 && initialIndex >= 0) {
      hasInitialized.current = true;
      setActivePostId(mergedPosts[initialIndex]?.id ?? null);
      setIsReady(true);
    }
  }, [mergedPosts, initialIndex]);

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
      length: containerHeight,
      offset: containerHeight * index,
      index,
    }),
    [containerHeight],
  );

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && fetchNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const keyExtractor = useCallback((item: FeedPost) => item.id, []);

  if (!containerHeight || !isReady) {
    return null;
  }

  return (
    <>
      <FlatList
        ref={flatListRef}
        data={mergedPosts}
        initialScrollIndex={initialIndex}
        extraData={extraData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        pagingEnabled
        snapToInterval={containerHeight}
        decelerationRate="fast"
        windowSize={5}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        updateCellsBatchingPeriod={100}
        removeClippedSubviews
        getItemLayout={getItemLayout}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        scrollsToTop={false}
        scrollEventThrottle={16}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </>
  );
}

export const PostViewerEngine = memo(PostViewerEngineComponent);
