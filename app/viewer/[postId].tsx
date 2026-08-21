import { PostViewerEngine } from "@/components/post/PostViewerEngine";
import SuccessModal from "@/components/ui/modals/successModal";
import colors from "@/constants/colors";
import { useBookmarkFolders } from "@/hooks/useBookmarkSettings";
import { useLikedPosts } from "@/services/graphQL/queries/actions/useLikedPosts";
import { useUserSavedPosts } from "@/hooks/useUserSavedPosts";
import { useDiscoverFeed } from "@/hooks/useDiscover";
import { usePostById } from "@/hooks/usePostById";
import { useUserPosts } from "@/hooks/useUserPost";
import { FeedPost } from "@/types/feedTypes";
import { normalizePost } from "@/utils/feed/normalizePost";
import { getNetworkModalCopy } from "@/utils/network/getNetworkModalCopy";
import { useIsFocused } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View, XStack } from "tamagui";
import { ChevronLeft } from "@tamagui/lucide-icons";

const styles = StyleSheet.create({
  backBtn: {
    position: "absolute",
    left: 12,
    zIndex: 9999,
    padding: 6,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 20,
  },
});

export default function PostViewerScreen() {
  const { source, index, postId, categoryId, slug, filter, userId: userIdParam, openComments } = useLocalSearchParams<{
    source?: string;
    index?: string;
    postId: string;
    categoryId?: string;
    slug?: string;
    filter?: string;
    userId?: string;
    openComments?: string;
  }>();

  const isLiked = source === "liked";
  const isBookmarks = source === "bookmarks";
  const isSaved = source === "saved";
  const isDiscover = !!categoryId;
  const isUserPosts = source === "user";

  /* ================= DATA ================= */

  const {
    data: singlePost,
    isLoading: isSingleLoading,
    isError: isSingleError,
    error: singleError,
    refetch: refetchSinglePost,
  } = usePostById(postId);

  const {
    posts: userPosts,
    isLoading: isUserLoading,
    isError: isUserError,
    refetch: refetchUserPosts,
  } = useUserPosts(userIdParam);

  const {
    posts: discoverPosts,
    isLoading: isDiscoverLoading,
    isError: isDiscoverError,
  } = useDiscoverFeed(categoryId, slug);

  const {
    data: likedData,
    isLoading: isLikedLoading,
    isError: isLikedError,
    error: likedError,
    refetch: refetchLikedPosts,
  } = useLikedPosts();

  const {
    data: bookmarkData,
    isLoading: isBookmarkLoading,
    isError: isBookmarkError,
    refetch: refetchBookmarks,
  } = useBookmarkFolders();

  const {
    data: savedData,
    isLoading: isSavedLoading,
    isError: isSavedError,
    refetch: refetchSavedPosts,
  } = useUserSavedPosts();

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

  /*  NORMALIZE BOOKMARK POSTS */
  const bookmarkPosts: FeedPost[] = useMemo(() => {
    if (!bookmarkData) return [];

    return bookmarkData
      .flatMap((folder) => folder.posts || [])
      .map((p) => normalizePost(p))
      .filter((p): p is FeedPost => {
        if (!p) return false;

        if (p.type === "media") {
          return Array.isArray(p.media) && p.media.length > 0;
        }

        return true;
      });
  }, [bookmarkData]);

  /*  NORMALIZE SAVED POSTS */
  const savedPosts: FeedPost[] = useMemo(() => {
    if (!savedData?.pages?.length) return [];

    return savedData.pages
      .flatMap((p) => p.posts ?? [])
      .map((p) => normalizePost(p))
      .filter((p): p is FeedPost => {
        if (!p) return false;

        if (p.type === "media") {
          return Array.isArray(p.media) && p.media.length > 0;
        }

        return true;
      });
  }, [savedData]);

  const filteredDiscoverPosts = useMemo(() => {
    if (!discoverPosts.length) return [];
    if (!filter || filter === "all") return discoverPosts;
    
    return discoverPosts.filter((post: FeedPost) => {
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
  }, [discoverPosts, filter]);

  // FIXED: Only use the source that was requested
  // Do NOT fall through to other sources
  let posts: FeedPost[] = [];
  let isLoading = true;
  let isError = false;
  let error: any = null;
  let refetch: () => void = () => {};

  if (isLiked) {
    posts = likedPosts;
    isLoading = isLikedLoading;
    isError = isLikedError;
    error = likedError;
    refetch = refetchLikedPosts;
  } else if (isBookmarks) {
    posts = bookmarkPosts;
    isLoading = isBookmarkLoading;
    isError = isBookmarkError;
    refetch = refetchBookmarks;
  } else if (isSaved) {
    posts = savedPosts;
    isLoading = isSavedLoading;
    isError = isSavedError;
    refetch = refetchSavedPosts;
  } else if (isUserPosts) {
    posts = userPosts;
    isLoading = isUserLoading;
    isError = isUserError;
    refetch = refetchUserPosts;
  } else if (isDiscover) {
    // Discover/category feed
    posts = filteredDiscoverPosts;
    isLoading = isDiscoverLoading;
    isError = isDiscoverError;
    refetch = () => {}; // No refetch for discover
  } else {
    // Default: fetch post by ID (deep link from share)
    posts = singlePost ? [singlePost] : [];
    isLoading = isSingleLoading;
    isError = isSingleError;
    error = singleError;
    refetch = refetchSinglePost;
  }

  // fallback to singlePost when the paginated source list doesn't contain the target post
  if (!!source && singlePost && !posts.find((p) => p.id === postId)) {
    posts = [singlePost, ...posts];
    isLoading = isSingleLoading;
  }

  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"warning" | "failed">("warning");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const isFocused = useIsFocused();

  const targetIndex = useMemo(() => {
    const idx = posts.findIndex((p) => p.id === postId);
    return idx;
  }, [postId, posts]);

  const isReady = !isLoading && posts.length > 0 && targetIndex >= 0;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!isError) return;

    const feedback = getNetworkModalCopy(
      error,
      "We couldn't load this post right now. Please try again.",
    );

    setModalType(feedback.type);
    setModalTitle(feedback.title);
    setModalMessage(feedback.message);
    setModalVisible(true);
  }, [isError, error]);

  const postNotFound = !isLoading && posts.length > 0 && targetIndex === -1;

  /* ================= LOADING ================= */

  if (isLoading || (!postNotFound && !isReady)) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size={40} color={colors.primary} />
      </View>
    );
  }

  if (postNotFound) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <View flex={1} justifyContent="center" alignItems="center" paddingHorizontal={24}>
          <Text fontSize={20} fontWeight="600" color={colors.black} marginBottom={8}>
            Post not found
          </Text>
          <Text fontSize={14} color={colors.gray} textAlign="center" marginBottom={24}>
            This post could not be found in your feed. It may have been removed.
          </Text>
          <XStack gap={12}>
            <TouchableOpacity
              onPress={() => refetch()}
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 8,
              }}
            >
              <Text color="white" fontWeight="600">Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                backgroundColor: colors.gray,
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 8,
              }}
            >
              <Text color="white" fontWeight="600">Go Back</Text>
            </TouchableOpacity>
          </XStack>
        </View>
      </SafeAreaView>
    );
  }

  /* ================= MAIN ================= */

  const handleBackPress = () => {
    try {
      router.back();
    } catch (err) {
      // fallback: if userId provided, navigate to guest profile
      if (userIdParam) router.push({ pathname: "/guest", params: { userId: userIdParam } });
      else router.back();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        flex={1}
        backgroundColor={colors.black}
        onLayout={(e) => {
          const { height, width } = e.nativeEvent.layout;
          setContainerHeight(height);
          setContainerWidth(width);
        }}
      >
        {!containerHeight ? null : (
          <PostViewerEngine
            posts={posts}
            initialIndex={targetIndex >= 0 ? targetIndex : 0}
            containerHeight={containerHeight}
            containerWidth={containerWidth}
            tabBarHeight={0}
            isScreenFocused={isFocused}
            autoOpenComments={openComments === "1"}
          />
        )}

        {/* Back button */}
        {(!source || isUserPosts || isDiscover || isLiked || isBookmarks || isSaved) && (
          <TouchableOpacity
            accessibilityLabel="Go back"
            onPress={handleBackPress}
            hitSlop={8}
            style={[styles.backBtn, { top: insets.top + 8 }]}
          >
            <ChevronLeft size={28} color={colors.white} />
          </TouchableOpacity>
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
          refetch();
        }}
      />
    </SafeAreaView>
  );
}
