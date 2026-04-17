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
}: Props) {
  const flatListRef = useRef<FlatList<FeedPost>>(null);
  const lastScrollTime = useRef(0);

  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [pausedPostId, setPausedPostId] = useState<string | null>(null);

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
  }, [posts, likedMap, savedMap, followedMap]);

  useEffect(() => {
    if (mergedPosts.length > 0 && initialIndex >= 0) {
      setActivePostId(mergedPosts[initialIndex]?.id ?? null);
    }
  }, [mergedPosts, initialIndex]);

  useEffect(() => {
    if (!mergedPosts.length || !containerHeight || initialIndex <= 0) return;
    if (initialIndex === undefined || initialIndex < 0) return;

    const targetId = mergedPosts[initialIndex]?.id;
    if (!targetId) return;

    const timeout = setTimeout(() => {
      flatListRef.current?.scrollToOffset({
        offset: initialIndex * containerHeight,
        animated: false,
      });
    }, 50);
    return () => clearTimeout(timeout);
  }, [mergedPosts, initialIndex, containerHeight]);

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
      const now = Date.now();
      if (now - lastScrollTime.current < 100) return;

      const current = viewableItems[0]?.item;
      if (!current?.id) return;

      lastScrollTime.current = now;
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

  if (!containerHeight) return null;

  return (
    <FlatList
      ref={flatListRef}
      data={mergedPosts}
      extraData={activePostId}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      pagingEnabled
      snapToInterval={containerHeight}
      decelerationRate="fast"
      windowSize={5}
      initialNumToRender={3}
      maxToRenderPerBatch={3}
      updateCellsBatchingPeriod={50}
      removeClippedSubviews
      getItemLayout={getItemLayout}
      viewabilityConfig={viewabilityConfig}
      onViewableItemsChanged={onViewableItemsChanged}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
      scrollsToTop={false}
    />
  );
}

export const PostViewerEngine = memo(PostViewerEngineComponent);
