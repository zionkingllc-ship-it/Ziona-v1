import { PostCard } from "@/components/post/PostCard";
import colors from "@/constants/colors";
import { preloadPostMedia } from "@/helpers/preloadMedia";
import { useUserPosts } from "@/hooks/useUserPost";
import { useLikedPosts } from "@/services/graphQL/queries/actions/useLikedPosts";
import { usePostActionsStore } from "@/store/usePostActionStore";
import { FeedPost } from "@/types/feedTypes";
import { normalizePost } from "@/utils/feed/normalizePost";  
import { mergePostState } from "@/utils/post/postState/mergePostState";
import { useLocalSearchParams } from "expo-router";
import { PostViewerEngine } from "@/components/post/PostViewerEngine";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, AppState, FlatList, ViewToken } from "react-native";
import { View } from "tamagui";

export default function ProfilePostViewerScreen() {
  const { source, index, postId } = useLocalSearchParams<{
    source?: string;
    index?: string;
    postId: string;
  }>();

  const isLiked = source === "liked";
  const tabBarHeight = 0;

  /* ================= DATA ================= */

  const {
    posts: userPosts,
    isLoading: isUserLoading,
  } = useUserPosts();

  const {
    data: likedData,
    isLoading: isLikedLoading,
  } = useLikedPosts();

  /*  NORMALIZE LIKED POSTS */
  const likedPosts: FeedPost[] = useMemo(() => {
    if (!likedData?.pages) return [];

    return likedData.pages
      .flatMap((p) => p.posts ?? [])
      .map((p) => normalizePost(p))
      .filter((p): p is FeedPost => {
        if (!p) return false;

        if (p.type === "media") {
          return Array.isArray(p.media) && p.media.length > 0;
        }

        return true;
      });
  }, [likedData]);

  const posts: FeedPost[] = isLiked ? likedPosts : userPosts;

  

  /* ================= REFS ================= */

  const flatListRef = useRef<FlatList<FeedPost>>(null);
  const hasScrolledRef = useRef(false);

  /* ================= STATE ================= */

  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [pausedPostId, setPausedPostId] = useState<string | null>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  /* ================= STORE ================= */

  const likedMap = usePostActionsStore((s) => s.likedPosts);
  const savedMap = usePostActionsStore((s) => s.savedPosts);
  const followedMap = usePostActionsStore((s) => s.followedUsers);

  /* ================= MERGE ================= */

  const mergedPosts = useMemo(() => {
    return posts.map((p) =>
      mergePostState(p, {
        likedPosts: likedMap,
        savedPosts: savedMap,
        followedUsers: followedMap,
      })
    );
  }, [posts, likedMap, savedMap, followedMap]);

  const targetIndex = useMemo(() => {
  const passedIndex = Number(index ?? -1);

  if (!isNaN(passedIndex) && passedIndex >= 0) {
    return passedIndex;
  }

  return mergedPosts.findIndex((p) => p.id === postId);
}, [index, postId, mergedPosts]);

  /* ================= INITIAL SCROLL ================= */

  useEffect(() => {
    if (hasScrolledRef.current) return;
    if (!mergedPosts.length) return;
    if (!containerHeight) return;

    const passedIndex = Number(index ?? -1);

    let targetIndex = passedIndex;

    if (isNaN(passedIndex) || passedIndex < 0) {
      targetIndex = mergedPosts.findIndex((p) => p.id === postId);
    }

    if (targetIndex < 0 || targetIndex >= mergedPosts.length) return;

    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({
        offset: targetIndex * containerHeight,
        animated: false,
      });

      setActivePostId(mergedPosts[targetIndex]?.id ?? null);
      hasScrolledRef.current = true;
    });
  }, [mergedPosts, postId, index, containerHeight]);

  /* ================= APP STATE ================= */

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        setActivePostId(null);
        setPausedPostId(null);
      }
    });

    return () => sub.remove();
  }, []);

  /* ================= VIEWABILITY ================= */

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
    minimumViewTime: 200,
  }).current;

  const prevIdRef = useRef<string | null>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (!viewableItems.length) return;

      const current = viewableItems[0].item;
      if (!current?.id) return;

      if (prevIdRef.current && prevIdRef.current !== current.id) {
        setPausedPostId(prevIdRef.current);
      }

      setActivePostId(current.id);
      setPausedPostId(null);

      prevIdRef.current = current.id;
    }
  ).current;

  /* ================= LOADING ================= */

  if (isUserLoading || isLikedLoading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size={40} color={colors.primary} />
      </View>
    );
  }

  /* ================= MAIN ================= */ 
    return (
    <View
      flex={1}
      onLayout={(e) => {
        const { height, width } = e.nativeEvent.layout;
        setContainerHeight(height);
        setContainerWidth(width);
      }}
    >
      {containerHeight === 0 ? null : (
       <PostViewerEngine
  posts={mergedPosts}
  initialIndex={targetIndex}
  containerHeight={containerHeight}
  containerWidth={containerWidth}
  tabBarHeight={0}
/>
      )}
    </View>
  );
}