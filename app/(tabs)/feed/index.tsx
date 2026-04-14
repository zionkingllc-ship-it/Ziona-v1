import FeedHeader from "@/components/feedHeader";
import { PostCard } from "@/components/post/PostCard";
import { PostViewerEngine } from "@/components/post/PostViewerEngine";
import FollowSuggestions from "@/components/following/FollowingSuggestions";
import SuccessModal from "@/components/ui/modals/successModal";
import colors from "@/constants/colors";
import { preloadPostMedia } from "@/helpers/preloadMedia";
import { useFollowingFeed, useForYouFeed } from "@/hooks/useFeed";
import { usePostActionsStore } from "@/store/usePostActionStore";
import { FeedPost } from "@/types/feedTypes";
import { normalizePost } from "@/utils/feed/normalizePost";
import { getNetworkModalCopy } from "@/utils/network/getNetworkModalCopy";
import { mergePostState } from "@/utils/post/postState/mergePostState";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  AppState,
  FlatList,
  Text,
  ViewToken,
} from "react-native";
import { View } from "tamagui";

export default function Feed() {
  const tabBarHeight = useBottomTabBarHeight();
  const flatListRef = useRef<FlatList<FeedPost>>(null);
  const queryClient = useQueryClient();

  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [feedType, setFeedType] = useState<"forYou" | "following">("forYou");
  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [pausedPostId, setPausedPostId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"warning" | "failed">("warning");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const forYouQuery = useForYouFeed();
  const followingQuery = useFollowingFeed();
  const query = feedType === "forYou" ? forYouQuery : followingQuery;
  const isFocused = useIsFocused();

  const likedMap = usePostActionsStore((s) => s.likedPosts);
  const savedMap = usePostActionsStore((s) => s.savedPosts);
  const followedMap = usePostActionsStore((s) => s.followedUsers);

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["forYouFeed"] });
      queryClient.invalidateQueries({ queryKey: ["followingFeed"] });

      setActivePostId(null);
    }, [queryClient]),
  );

  useFocusEffect(
    useCallback(() => {
      return () => {
        setActivePostId(null);
        setPausedPostId(null);
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

  useEffect(() => {
    if (!query.isError) return;

    const feedback = getNetworkModalCopy(
      query.error,
      "We couldn't load your feed right now. Please try again.",
    );

    setModalType(feedback.type);
    setModalTitle(feedback.title);
    setModalMessage(feedback.message);
    setModalVisible(true);
  }, [query.isError, query.error]);

  const pages =
    (query.data as InfiniteData<{ posts: any[] }> | undefined)?.pages ?? [];
  const data: FeedPost[] = useMemo(() => {
    if (!pages.length) return [];

    return pages
      .flatMap((page) => page.posts ?? [])
      .map((p) => normalizePost(p))
      .filter((p): p is FeedPost => {
        if (!p) return false;

        if (p.type === "media") {
          return Array.isArray(p.media) && p.media.length > 0;
        }

        return true;
      })
      .map((post) =>
        mergePostState(post, {
          likedPosts: likedMap,
          savedPosts: savedMap,
          followedUsers: followedMap,
        }),
      );
  }, [pages, likedMap, savedMap, followedMap]);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
    minimumViewTime: 200,
  }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (!viewableItems.length) return;

      const current = viewableItems[0].item;
      if (!current?.id) return;

      // prevent loop
      if (current.id === activePostId) return;

      setPausedPostId(null);
      setActivePostId(current.id);

      const index = data.findIndex((p) => p.id === current.id);

      if (index >= 0) {
        if (data[index + 1]) preloadPostMedia(data[index + 1] as any);
        if (data[index - 1]) preloadPostMedia(data[index - 1] as any);
      }
    },
  ).current;

  const renderItem = useCallback(
    ({ item }: { item: FeedPost }) => (
      <PostCard
        post={item}
        isPlaying={item.id === activePostId && item.id !== pausedPostId}
        onTogglePlay={() => {
          setPausedPostId((prev) => (prev === item.id ? null : item.id));
        }}
        screenHeight={containerHeight}
        screenWidth={containerWidth}
        tabBarHeight={tabBarHeight}
      />
    ),
    [activePostId, pausedPostId, containerHeight, containerWidth, tabBarHeight],
  );

  if (query.isLoading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size={40} color={colors.primary} />
      </View>
    );
  }

  const handleBellPress = () => {
    router.push("/notifications");
  };

  return (
    <View flex={1}>
      <View width="100%" marginTop={35}>
        <FeedHeader
          feedType={feedType}
          onChangeFeedType={setFeedType}
          emptyFollowing={data.length === 0}
          onBellPress={handleBellPress}
        />
      </View>

      <View
        style={{ flex: 1 }}
        onLayout={(e) => {
          const { height, width } = e.nativeEvent.layout;
          if (height !== containerHeight) setContainerHeight(height);
          if (width !== containerWidth) setContainerWidth(width);
        }}
      >
        {feedType === "following" && data.length === 0 && !query.isLoading ? (
          <FollowSuggestions onDone={() => setFeedType("forYou")} />
        ) : data.length === 0 ? (
          <View flex={1} justifyContent="center" alignItems="center">
            <Text style={{ color: colors.text }}>No posts yet</Text>
          </View>
        ) : (
          <PostViewerEngine
            posts={data}
            containerHeight={containerHeight}
            containerWidth={containerWidth}
            tabBarHeight={tabBarHeight}
            isScreenFocused={isFocused}
            fetchNextPage={query.fetchNextPage}
            hasNextPage={query.hasNextPage}
            isFetchingNextPage={query.isFetchingNextPage}
          />
        )}
      </View>

      <SuccessModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        autoClose
        withButton
        buttonText="Try again"
        onButtonPress={() => {
          setModalVisible(false);
          query.refetch();
        }}
      />
    </View>
  );
}
