import { PostViewerEngine } from "@/components/post/PostViewerEngine";
import SuccessModal from "@/components/ui/modals/successModal";
import colors from "@/constants/colors";
import { useUserPosts } from "@/hooks/useUserPost";
import { useBookmarkFolders } from "@/hooks/useBookmarkSettings";
import { useLikedPosts } from "@/services/graphQL/queries/actions/useLikedPosts";
import { useUserSavedPosts } from "@/hooks/useUserSavedPosts";
import { FeedPost } from "@/types/feedTypes";
import { normalizePost } from "@/utils/feed/normalizePost";
import { getNetworkModalCopy } from "@/utils/network/getNetworkModalCopy";
import { useIsFocused } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "tamagui";

export default function PostViewerScreen() {
  const { source, index, postId } = useLocalSearchParams<{
    source?: string;
    index?: string;
    postId: string;
  }>();

  const isLiked = source === "liked";
  const isBookmarks = source === "bookmarks";
  const isSaved = source === "saved";

  /* ================= DATA ================= */

  const {
    posts: userPosts,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
    refetch: refetchUserPosts,
  } = useUserPosts();

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

  const posts: FeedPost[] = isLiked ? likedPosts : isBookmarks ? bookmarkPosts : isSaved ? savedPosts : userPosts;
  const isLoading = isUserLoading || isLikedLoading || isBookmarkLoading || isSavedLoading;
  const isError = isUserError || isLikedError || isBookmarkError || isSavedError;
  const error = isLiked ? likedError : isUserError;
  const refetch = isLiked ? refetchLikedPosts : isBookmarks ? refetchBookmarks : isSaved ? refetchSavedPosts : refetchUserPosts;

  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"warning" | "failed">("warning");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const isFocused = useIsFocused();

  const targetIndex = useMemo(() => {
    const passedIndex = Number(index ?? -1);

    if (!isNaN(passedIndex) && passedIndex >= 0) {
      return passedIndex;
    }

    return posts.findIndex((p) => p.id === postId);
  }, [index, postId, posts]);

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

  /* ================= LOADING ================= */

  if (isLoading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size={40} color={colors.primary} />
      </View>
    );
  }

  /* ================= MAIN ================= */

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
        {containerHeight === 0 ? null : (
          <PostViewerEngine
            posts={posts}
            initialIndex={targetIndex >= 0 ? targetIndex : 0}
            containerHeight={containerHeight}
            containerWidth={containerWidth}
            tabBarHeight={0}
            isScreenFocused={isFocused}
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
          refetch();
        }}
      />
    </SafeAreaView>
  );
}
