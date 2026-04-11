import colors from "@/constants/colors";
import { useUserPosts } from "@/hooks/useUserPost";
import { PostViewerEngine } from "@/components/post/PostViewerEngine";
import SuccessModal from "@/components/ui/modals/successModal";
import { useLikedPosts } from "@/services/graphQL/queries/actions/useLikedPosts";
import { FeedPost } from "@/types/feedTypes";
import { normalizePost } from "@/utils/feed/normalizePost";
import { getNetworkModalCopy } from "@/utils/network/getNetworkModalCopy";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator } from "react-native";
import { View } from "tamagui";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfilePostViewerScreen() {
  const { source, index, postId } = useLocalSearchParams<{
    source?: string;
    index?: string;
    postId: string;
  }>();

  const isLiked = source === "liked";

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

  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"warning" | "failed">("warning");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const targetIndex = useMemo(() => {
    const passedIndex = Number(index ?? -1);

    if (!isNaN(passedIndex) && passedIndex >= 0) {
      return passedIndex;
    }

    return posts.findIndex((p) => p.id === postId);
  }, [index, postId, posts]);

  useEffect(() => {
    const error = isLiked ? likedError : userError;
    const isError = isLiked ? isLikedError : isUserError;

    if (!isError) return;

    const feedback = getNetworkModalCopy(
      error,
      "We couldn't load this post right now. Please try again.",
    );

    setModalType(feedback.type);
    setModalTitle(feedback.title);
    setModalMessage(feedback.message);
    setModalVisible(true);
  }, [isLiked, isLikedError, likedError, isUserError, userError]);

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
    <SafeAreaView style={{flex:1}}>
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
          if (isLiked) {
            refetchLikedPosts();
          } else {
            refetchUserPosts();
          }
        }}
      />
    </SafeAreaView>
  );
}
