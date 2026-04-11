import colors from "@/constants/colors";
import { useBookmarkFlow } from "@/hooks/useBookmarkFlow";
import { useBookmarksStore } from "@/store/useBookmarkStore";
import { usePostActionsStore } from "@/store/usePostActionStore";
import { FeedPost } from "@/types/feedTypes";
import { MoreHorizontal } from "@tamagui/lucide-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, TouchableOpacity } from "react-native";
import { Image, Text, XStack, YStack } from "tamagui";
import PostMedia from "./postcard/PostMedia";

import { CommentsSheet } from "../comments/commentsModal";
import BookmarkFoldersModal from "../ui/modals/BookmarkFoldersModal";
import ConfirmReportModal from "../ui/modals/ConfirmReportModal";
import CreateFolderModal from "../ui/modals/CreateFolderModal";
import ReportReasonsModal from "../ui/modals/ReportReasonsModal";
import ShareModal from "../ui/modals/ShareModal";
import SuccessModal from "../ui/modals/successModal";

import { useToggleLike } from "@/hooks/useToggleLike";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* ICONS */
const likeIcon = require("@/assets/images/likeIcon.png");
const likeIconActive = require("@/assets/images/likeIcon2.png");
const commentIcon = require("@/assets/images/commentIcon.png");
const bookmarkIcon = require("@/assets/images/bookmarkIcon.png");
const bookmarkIconActive = require("@/assets/images/bookmarkIconActive.png");
const shareIcon = require("@/assets/images/shareIcon.png");

type Props = {
  post: FeedPost;
  isPlaying: boolean;
  screenHeight: number;
  onTogglePlay?: () => void;
  screenWidth: number;
  tabBarHeight: number;
};

function PostCardComponent({
  post,
  isPlaying,
  screenHeight,
  onTogglePlay,
  screenWidth,
  tabBarHeight,
}: Props) {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(false);

  /* MODALS */
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [reasonsVisible, setReasonsVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);

  const likedState = post.viewerState.liked;
  const likeCount = post.stats.likesCount;

  const { folders, getSavedFolderIds } = useBookmarksStore();
  const savedFolderIds = getSavedFolderIds(post.id);
  const isBookmarked = post.viewerState?.saved || savedFolderIds.length > 0;
  const {
    foldersVisible,
    createVisible,
    openFolders,
    setFoldersVisible,
    setCreateVisible,
    toggleFolder,
    createFolder,
    isCreating,
  } = useBookmarkFlow(post.id, post.viewerState.saved || isBookmarked);
  const isLikePending = usePostActionsStore(
    (s) => s.pendingLikes[post.id] ?? false,
  );

  const toggleLikeMutation = useToggleLike();

  /* RESET CAPTION ON POST CHANGE */
  useEffect(() => {
    setExpanded(false);
  }, [post.id]);

  /* HANDLERS (MEMO SAFE) */
  const handleLike = () => {
    if (isLikePending) return;

    toggleLikeMutation.mutate({
      postId: post.id,
      currentLiked: likedState,
    });
  };

  /* MEDIA PROPS MEMO */
  const mediaProps = useMemo(
    () => ({
      post,
      isPlaying,
      onTogglePlay,
      screenWidth,
      screenHeight,
      tabBarHeight,
      onLike: handleLike,
    }),
    [post, isPlaying, screenWidth, screenHeight, tabBarHeight],
  );

  return (
    <YStack height={screenHeight} width="100%" backgroundColor="black">
      {/* MEDIA */}
      <PostMedia {...mediaProps} />

      {/* GRADIENT OVERLAY FOR TEXT VISIBILITY */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.7)"]}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 200,
        }}
      />

      {/* OVERLAY */}
      <YStack
        position="absolute"
        bottom={Math.max(insets.bottom-12)}
        width="100%"
        paddingTop={insets.top + 12}
      >
        <XStack padding="$4" alignItems="flex-end">
          {/* LEFT SIDE */}
          <YStack flex={1} gap="$2">
            {/* PROFILE */}
            <XStack gap="$4" alignItems="center">
              <XStack gap="$2" alignItems="center">
                <Image
                  source={
                    post.author?.avatarUrl
                      ? { uri: post.author.avatarUrl }
                      : require("@/assets/images/profile.png")
                  }
                  width={30}
                  height={30}
                  borderRadius={15}
                />

                <Text color={colors.white} fontSize={16} fontWeight="500">
                  {post.author?.username ?? "user"}
                </Text>
              </XStack>

              {!post.viewerState?.isOwner && (
                <TouchableOpacity
                  style={{
                    borderWidth: 1,
                    borderColor: colors.white,
                    height: 22,
                    borderRadius: 8,
                    paddingHorizontal: 6,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text color={colors.white} fontSize={13}>
                    {post.viewerState?.followingAuthor ? "following" : "follow"}
                  </Text>
                </TouchableOpacity>
              )}
            </XStack>

            {/* CAPTION */}
            {"caption" in post && post.caption && (
              <XStack maxWidth="80%" alignItems="flex-end">
                <Text
                  color={colors.white}
                  fontSize={16}
                  numberOfLines={expanded ? undefined : 3}
                >
                  {post.caption}
                </Text>

                {post.caption.length > 90 && (
                  <Pressable onPress={() => setExpanded((p) => !p)}>
                    <LinearGradient
                      colors={["transparent", "rgba(55,55,55,0.6)"]}
                      style={{
                        position: "absolute",
                        bottom: 0,
                        height: 24,
                        width: "100%",
                      }}
                    />
                    <Text color={colors.white} fontSize={14}>
                      {expanded ? "less" : "more"}
                    </Text>
                  </Pressable>
                )}
              </XStack>
            )}
          </YStack>

          {/* RIGHT ACTIONS */}
          <YStack gap="$4">
            <YStack alignItems="center">
              <Pressable onPress={handleLike}>
                <Image
                  source={likedState ? likeIconActive : likeIcon}
                  width={24}
                  height={24}
                />
              </Pressable>
              <Text color={colors.white} fontSize={12}>
                {likeCount}
              </Text>
            </YStack>

            <Pressable onPress={() => setCommentsVisible(true)}>
              <Image source={commentIcon} width={24} height={24} />
            </Pressable>

            <Pressable onPress={openFolders}>
              <Image
                source={isBookmarked ? bookmarkIconActive : bookmarkIcon}
                width={24}
                height={24}
              />
            </Pressable>

            <Pressable onPress={() => setShareVisible(true)}>
              <Image source={shareIcon} width={24} height={24} />
            </Pressable>

            <Pressable onPress={() => setConfirmVisible(true)}>
              <MoreHorizontal size={28} color={colors.white} />
            </Pressable>
          </YStack>
        </XStack>
      </YStack>

      {/* MODALS */}
      <CommentsSheet
        visible={commentsVisible}
        onClose={() => setCommentsVisible(false)}
        postId={post.id}
      />
      <ConfirmReportModal
        visible={confirmVisible}
        onClose={() => setConfirmVisible(false)}
        onConfirm={() => {
          setConfirmVisible(false);
          setReasonsVisible(true);
        }}
      />
      <ReportReasonsModal
        visible={reasonsVisible}
        onClose={() => setReasonsVisible(false)}
        onSelectReason={() => {
          setReasonsVisible(false);
          setSuccessVisible(true);
        }}
        onSelectOther={() => {}}
      />
      <ShareModal
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        post={post}
      />
      <SuccessModal
        visible={successVisible}
        onClose={() => setSuccessVisible(false)}
      />
      <BookmarkFoldersModal
        visible={foldersVisible}
        savedFolderIds={savedFolderIds}
        onClose={() => setFoldersVisible(false)}
        onToggleFolder={toggleFolder}
        onCreateNew={() => {
          setFoldersVisible(false);
          setCreateVisible(true);
        }}
      />
      <CreateFolderModal
        visible={createVisible}
        post={post}
        onClose={() => setCreateVisible(false)}
        onSave={(name) => {
          createFolder(name);
          setCreateVisible(false);
        }}
      />
    </YStack>
  );
}

/* 🔥 CRITICAL: PREVENT RE-RENDERS */
export const PostCard = React.memo(
  PostCardComponent,
  (prev, next) =>
    prev.post === next.post &&
    prev.isPlaying === next.isPlaying &&
    prev.screenHeight === next.screenHeight &&
    prev.screenWidth === next.screenWidth &&
    prev.tabBarHeight === next.tabBarHeight,
);
