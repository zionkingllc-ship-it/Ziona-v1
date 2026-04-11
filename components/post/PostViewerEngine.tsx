import { PostCard } from "@/components/post/PostCard";
import { usePostActionsStore } from "@/store/usePostActionStore";
import { FeedPost } from "@/types/feedTypes";
import { mergePostState } from "@/utils/post/postState/mergePostState";
import React, {
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
};

export function PostViewerEngine({
  posts,
  initialIndex = 0,
  containerHeight,
  containerWidth,
  tabBarHeight,
  isScreenFocused,
}: Props) {
  const flatListRef = useRef<FlatList<FeedPost>>(null);
  const hasScrolledRef = useRef(false);

  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [pausedPostId, setPausedPostId] = useState<string | null>(null);

  /* GLOBAL STATE */
  const likedMap = usePostActionsStore((s) => s.likedPosts);
  const savedMap = usePostActionsStore((s) => s.savedPosts);
  const followedMap = usePostActionsStore((s) => s.followedUsers);

  /* MERGED POSTS */
  const mergedPosts = useMemo(() => {
    return posts.map((p) =>
      mergePostState(p, {
        likedPosts: likedMap,
        savedPosts: savedMap,
        followedUsers: followedMap,
      }),
    );
  }, [posts, likedMap, savedMap, followedMap]);

  /* INITIAL ACTIVE */
  useEffect(() => {
    if (mergedPosts.length > 0) {
      setActivePostId(mergedPosts[initialIndex]?.id ?? null);
    }
  }, [mergedPosts, initialIndex]);

  /* INITIAL SCROLL */
  useEffect(() => {
    if (hasScrolledRef.current) return;
    if (!mergedPosts.length || !containerHeight) return;

    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({
        offset: initialIndex * containerHeight,
        animated: false,
      });

      hasScrolledRef.current = true;
    });
  }, [mergedPosts, initialIndex, containerHeight]);

  /* APP STATE */
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        setActivePostId(null);
        setPausedPostId(null);
      }
    });

    return () => sub.remove();
  }, []);

  /* VIEWABILITY */
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (!viewableItems.length) return;

      const current = viewableItems[0]?.item;
      if (!current?.id) return;

      setActivePostId(current.id);
      setPausedPostId(null);
    },
  ).current;

  /* RENDER */
  const renderItem = useCallback(
    ({ item }: { item: FeedPost }) => {
      const isActive = item.id === activePostId;
      const isPaused = item.id === pausedPostId;

      const shouldPlay = isScreenFocused && isActive && !isPaused;

      return (
        <PostCard
          post={item}
          isPlaying={isActive && !isPaused}
          onTogglePlay={() => {
            setPausedPostId((prev) => (prev === item.id ? null : item.id));
          }}
          screenHeight={containerHeight}
          screenWidth={containerWidth}
          tabBarHeight={tabBarHeight}
        />
      );
    },
    [activePostId, pausedPostId, containerHeight, containerWidth, tabBarHeight],
  );

  /* LAYOUT */
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: containerHeight,
      offset: containerHeight * index,
      index,
    }),
    [containerHeight],
  );

  if (!containerHeight) return null;

  return (
    <FlatList
      ref={flatListRef}
      data={mergedPosts}
      extraData={`${activePostId ?? ""}:${pausedPostId ?? ""}`}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      pagingEnabled
      snapToInterval={containerHeight}
      decelerationRate="fast"
      windowSize={3}
      initialNumToRender={1}
      maxToRenderPerBatch={2}
      removeClippedSubviews
      getItemLayout={getItemLayout}
      viewabilityConfig={viewabilityConfig}
      onViewableItemsChanged={onViewableItemsChanged}
      showsVerticalScrollIndicator={false}
    />
  );
}
