import FeedHeader from "@/components/feedHeader";
import { PostCard } from "@/components/post/PostCard";
import { PostViewerEngine } from "@/components/post/PostViewerEngine";
import FollowSuggestions from "@/components/following/FollowingSuggestions";
import SuccessModal from "@/components/ui/modals/successModal";
import colors from "@/constants/colors";
import { preloadPostMedia } from "@/helpers/preloadMedia";
import { useFollowingFeed, useForYouFeed } from "@/hooks/useFeed";
import { useUnreadCount } from "@/hooks/useNotifications";
import { FeedPost } from "@/types/feedTypes";
import { normalizePost } from "@/utils/feed/normalizePost";
import { getNetworkModalCopy } from "@/utils/network/getNetworkModalCopy";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/useAuthStore";

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
  const [refreshingFeed, setRefreshingFeed] = useState(false);
  const { data: unreadCount } = useUnreadCount();
  console.log("🟦 NOTIFICATION: unreadCount from hook:", unreadCount);

  const onRefreshFeed = useCallback(async () => {
    setRefreshingFeed(true);
    try {
      const key = feedType === "forYou" ? "forYouFeed" : "followingFeed";
      await queryClient.refetchQueries({ queryKey: [key] });
    } catch (err) {
      console.error("Feed refresh failed:", err);
    } finally {
      setRefreshingFeed(false);
    }
  }, [feedType, queryClient]);

  useFocusEffect(
    useCallback(() => {
      if (!query.data && !query.isLoading) {
        queryClient.invalidateQueries({ queryKey: ["forYouFeed"] });
        queryClient.invalidateQueries({ queryKey: ["followingFeed"] });
      }

      setActivePostId(null);
    }, [queryClient, query.data, query.isLoading]),
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
    (query.data as InfiniteData<{ posts: any[] } | undefined> | undefined)?.pages ?? [];
  const data: FeedPost[] = useMemo(() => {
    if (!pages.length) return [];

    // Deduplicate posts by ID to prevent duplicate key error
    const seenIds = new Set<string>();
    const uniquePosts: FeedPost[] = [];

    pages
      .flatMap((page) => page.posts ?? [])
      .map((p) => normalizePost(p))
      .filter((p): p is FeedPost => {
        if (!p) return false;

        if (p.type === "media") {
          return Array.isArray(p.media) && p.media.length > 0;
        }

        return true;
      })
      .forEach((post) => {
        if (!seenIds.has(post.id)) {
          seenIds.add(post.id);
          uniquePosts.push(post);
        }
      });

    return uniquePosts;
  }, [pages]);

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

  const handleBellPress = () => {
    console.log("🟦 NOTIFICATION: bell pressed, unreadCount:", unreadCount);
    const isAuth = useAuthStore.getState().isAuthenticated;
    if (!isAuth) {
      router.push("/(auth)/login/");
      return;
    }
    router.push("/notifications");
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <View flex={1}>
        <View width="100%">
          <FeedHeader
            feedType={feedType}
            onChangeFeedType={setFeedType}
            emptyFollowing={data.length === 0}
            onBellPress={handleBellPress}
            unreadCount={unreadCount ?? 0}
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
          {query.isLoading ? (
            <View flex={1} justifyContent="center" alignItems="center">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : feedType === "following" && data.length === 0 ? (
            <FollowSuggestions onDone={() => setFeedType("forYou")} />
          ) : data.length === 0 ? (
            <View flex={1} justifyContent="center" alignItems="center">
              <Text style={{ color: colors.text }}>No posts yet</Text>
            </View>
          ) : (
          <PostViewerEngine
            key={feedType}
            posts={data}
            containerHeight={containerHeight}
            containerWidth={containerWidth}
            tabBarHeight={tabBarHeight}
            isScreenFocused={isFocused}
            fetchNextPage={query.fetchNextPage}
            hasNextPage={query.hasNextPage}
            isFetchingNextPage={query.isFetchingNextPage}
            refreshing={refreshingFeed}
            onRefresh={onRefreshFeed}
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
    </View></SafeAreaView>
  );
}
