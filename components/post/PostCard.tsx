import colors from "@/constants/colors";
import { useResponsiveSize } from "@/hooks/useResponsiveSize";
import { useBookmarksStore } from "@/store/useBookmarkStore";
import { FeedPost } from "@/types/feedTypes";
import { MoreHorizontal } from "@tamagui/lucide-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { Pressable } from "react-native";
import { Image, Text, XStack, YStack } from "tamagui";
import PostMedia from "./postcard/PostMedia";

/* MODALS */
import { TouchableOpacity } from "react-native";
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
  liked: boolean;
  isPlaying: boolean;
  screenHeight: number;
  onTogglePlay?: () => void;
  screenWidth: number;
  tabBarHeight: number;
};

export function PostCard({
  post,
  isPlaying,
  screenHeight,
  onTogglePlay,
  screenWidth,
  tabBarHeight,
  liked,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [reasonsVisible, setReasonsVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [foldersVisible, setFoldersVisible] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);

  const likedState = liked;
  const likeCount = post.stats.likesCount;
  const insets = useSafeAreaInsets();

  const toggleLikeMutation = useToggleLike();

  const { folders, toggleBookmark, getSavedFolderIds, createFolder } =
    useBookmarksStore();

  const savedFolderIds = getSavedFolderIds(post.id);
  const isBookmarked = savedFolderIds.length > 0;

  const { getIconSize, getAvatarSize, getFontSize } = useResponsiveSize();

  useEffect(() => {
    setExpanded(false);
  }, [post.id]);

  const handleLike = () => {
    toggleLikeMutation.mutate({
      postId: post.id,
    });
  };

  return (
    <YStack height={screenHeight} width="100%" backgroundColor="black">
      {/* MEDIA */}
      <PostMedia
        post={post}
        isPlaying={isPlaying}
        onTogglePlay={onTogglePlay}
        screenWidth={screenWidth}
        screenHeight={screenHeight}
        tabBarHeight={tabBarHeight}
        onLike={handleLike}
      />

      {/*SINGLE OVERLAY*/}
      <YStack position="absolute" bottom={tabBarHeight/3} width="100%">
        <XStack padding="$4" alignItems="flex-end">
          <YStack flex={1} gap="$2">
            {/* PROFILE ROW */}
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
                  <Text color={colors.white} fontSize={13} fontWeight="500">
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
                      colors={["transparent", "rgba(55, 55, 55, 0.6)"]}
                      style={{
                        position: "absolute",
                        bottom: 0,
                        height: 24,
                        width: "100%",
                      }}
                    />

                    <Text
                      color={colors.white}
                      fontSize={14}
                      fontWeight="600"
                      alignSelf="flex-end"
                    >
                      {expanded ? "less" : "more"}
                    </Text>
                  </Pressable>
                )}
              </XStack>
            )}
          </YStack>

          {/* ACTIONS */}
          <YStack gap="$4">
            <YStack justifyContent="center" alignItems="center">
              <Pressable onPress={handleLike}>
                <Image
                  source={likedState ? likeIconActive : likeIcon}
                  width={24}
                  height={24}
                />
              </Pressable>
              <Text color={colors.white} fontFamily={"$body"} fontSize={12}>
                {likeCount}
              </Text>
            </YStack>

            <Pressable onPress={() => setCommentsVisible(true)}>
              <Image source={commentIcon} width={24} height={24} />
            </Pressable>

            <Pressable onPress={() => setFoldersVisible(true)}>
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

      {/* MODALS (UNCHANGED) */}
      <CommentsSheet
        visible={commentsVisible}
        onClose={() => setCommentsVisible(false)}
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
        folders={folders}
        savedFolderIds={savedFolderIds}
        onClose={() => setFoldersVisible(false)}
        onToggleFolder={(id) => toggleBookmark(post.id, id)}
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
          createFolder(name, "", post.id);
          setCreateVisible(false);
        }}
      />
    </YStack>
  );
}
