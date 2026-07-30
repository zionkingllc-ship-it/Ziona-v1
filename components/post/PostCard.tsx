import colors from "@/constants/colors";
import { useBookmarkFlow } from "@/hooks/useBookmarkFlow";
import { useBookmarksStore } from "@/store/useBookmarkStore";
import { usePostActionsStore } from "@/store/usePostActionStore";
import { FeedPost } from "@/types/feedTypes";
import { MoreHorizontal } from "@tamagui/lucide-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, TouchableOpacity } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Image as ExpoImage } from "expo-image";
import { Image, Text, View, XStack, YStack } from "tamagui";
import PostMedia from "./postcard/PostMedia";

import { CommentsSheet } from "../comments/commentsModal";
import BookmarkFoldersModal from "../ui/modals/BookmarkFoldersModal";
import ConfirmReportModal from "../ui/modals/ConfirmReportModal";
import CreateFolderModal from "../ui/modals/CreateFolderModal";
import ReportReasonsModal from "../ui/modals/ReportReasonsModal";
import OtherReportModal from "../ui/modals/OtherReportModal";
import ShareModal from "../ui/modals/ShareModal";
import SuccessModal from "../ui/modals/successModal";
import OptionsModal from "../ui/modals/OptionsModal";

import { useToggleLike } from "@/hooks/useToggleLike";
import { useToggleFollow } from "@/hooks/useFollow";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthStore } from "@/store/useAuthStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useReportContent } from "@/hooks/useReportContent";
import { ReportReason } from "@/services/graphQL/mutation/actions/report";

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
  isActive?: boolean;
  screenHeight: number;
  onTogglePlay?: () => void;
  screenWidth: number;
  tabBarHeight: number;
};

function getInitials(name?: string): string {
  if (!name) return "Ur";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getColorFromName(name?: string): string {
  if (!name) return "#7A2E8A";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ["#7A2E8A", "#4A90A4", "#E58E26", "#2E8A6A", "#8A4A2E", "#4A2E8A"];
  return colors[Math.abs(hash) % colors.length];
}

function AuthorAvatar({ username, avatarUrl }: { username?: string; avatarUrl?: string | null }) {
  const [failed, setFailed] = useState(false);
  const hasValidUri = avatarUrl && avatarUrl.trim() && !failed;

  if (!hasValidUri) {
    const initials = getInitials(username);
    const bgColor = getColorFromName(username);
    return (
      <XStack
        width={30} height={30} borderRadius={15}
        backgroundColor={bgColor}
        alignItems="center" justifyContent="center"
      >
        <Text color="white" fontSize={11} fontWeight="600">{initials}</Text>
      </XStack>
    );
  }

  return (
    <ExpoImage
      source={{ uri: avatarUrl }}
      style={{ width: 30, height: 30, borderRadius: 15 }}
      onError={() => setFailed(true)}
    />
  );
}

function PostCardComponent({
  post,
  isPlaying,
  isActive,
  screenHeight,
  onTogglePlay,
  screenWidth,
  tabBarHeight,
}: Props) {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(false);

  /* MODALS */
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [reasonsVisible, setReasonsVisible] = useState(false);
  const [otherVisible, setOtherVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [successType, setSuccessType] = useState<"success" | "failed" | "warning" | "softwarning">("success");
  const [bookmarkFeedback, setBookmarkFeedback] = useState<{ visible: boolean; type: "success" | "failed"; title: string; message: string }>({ visible: false, type: "success", title: "", message: "" });
  const [shareVisible, setShareVisible] = useState(false);

  const currentUserId = useAuthStore((s) => s.user?.id);
  const { data: currentProfile } = useUserProfile(currentUserId || "", { enabled: !!currentUserId });
  const hideLikeCount = currentProfile?.hideLikeCount ?? false;

  const likedState = usePostActionsStore(
    (s) => s.likedPosts[post.id] ?? post.viewerState?.liked ?? false,
  );
  const baseLiked = post.viewerState?.liked ?? false;
  const baseCount = Number(post.stats?.likesCount) || 0;
  const effectiveBaseCount = (baseLiked && baseCount === 0) ? 1 : baseCount;
  const likeCount = likedState !== baseLiked
    ? effectiveBaseCount + (likedState ? 1 : -1)
    : effectiveBaseCount;
  const commentCount = post.stats?.commentsCount ?? 0;
  const savedCount = post.stats?.savesCount ?? 0;

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
  } = useBookmarkFlow(post.id, post.viewerState?.saved || isBookmarked);
  const isLikePending = usePostActionsStore(
    (s) => s.pendingLikes[post.id] ?? false,
  );
  const isSavePending = usePostActionsStore(
    (s) => s.pendingSaves[post.id] ?? false,
  );

  const toggleLikeMutation = useToggleLike();
  const toggleFollowMutation = useToggleFollow();
  const followedUsers = usePostActionsStore((s) => s.followedUsers);
  const isFollowing = followedUsers[post.author?.id ?? ""] ?? post.viewerState?.followingAuthor ?? false;
  const { requireAuth, AuthModal } = useRequireAuth();
  const reportMutation = useReportContent();

  /* RESET CAPTION ON POST CHANGE */
  useEffect(() => {
    setExpanded(false);
  }, [post.id]);

  /* HANDLERS (MEMO SAFE) */
  const handleLike = () => {
    if (isLikePending) return;
    requireAuth(() => {
      toggleLikeMutation.mutate({
        postId: post.id,
        currentLiked: likedState,
      });
    });
  };

  const handleDoubleTapLike = useCallback(() => {
    if (isLikePending || likedState) return;
    requireAuth(() => {
      toggleLikeMutation.mutate({
        postId: post.id,
        currentLiked: false,
      });
    });
  }, [post.id, likedState, isLikePending, requireAuth, toggleLikeMutation]);

  const handleComment = useCallback(() => {
    requireAuth(() => setCommentsVisible(true));
  }, [requireAuth, setCommentsVisible]);

  const handleBookmark = useCallback(() => {
    requireAuth(openFolders);
  }, [requireAuth, openFolders]);

  const handleShare = useCallback(() => {
    requireAuth(() => setShareVisible(true));
  }, [requireAuth, setShareVisible]);

  const handleToggleFolder = useCallback((folderId?: string) => {
    if (!folderId) return;
    const isInFolder = savedFolderIds.includes(folderId);

    let coverUri: string | undefined;
    if (!isInFolder) {
      if (post.type === "media") {
        const first = post.media?.[0];
        coverUri = first?.thumbnailUrl || first?.url || undefined;
      } else if (post.type === "text" || post.type === "bible") {
        const cardText = post.type === "text"
          ? (post.textMessage?.trim() || post.scripture?.text?.trim() || "")
          : (post.scripture?.text ?? post.textMessage ?? "");
        if (cardText) {
          coverUri = `__post__:${JSON.stringify({
            postId: post.id,
            postType: post.type,
            textMessage: post.textMessage || undefined,
            scriptureText: post.scripture?.text || undefined,
            bgColor: post.category?.bgColor || "#181419",
          })}`;
        }
      }
    }

    toggleFolder(folderId, {
      onSuccess: () => {
        if (isInFolder) {
          setBookmarkFeedback({ visible: true, type: "success", title: "Removed", message: "Post removed from folder." });
        } else {
          setBookmarkFeedback({ visible: true, type: "success", title: "Saved", message: "Post saved." });
        }
      },
      onError: () => {
        setBookmarkFeedback({ visible: true, type: "failed", title: "Failed to Save", message: "Please try again." });
      },
    }, coverUri);
  }, [toggleFolder, savedFolderIds, post]);

  const handleOptions = useCallback(() => {
    requireAuth(() => setOptionsVisible(true));
  }, [requireAuth, setOptionsVisible]);

  const handleToggleExpanded = useCallback(() => {
    setExpanded((p) => !p);
  }, []);

  const handleFollow = () => {
    if (!post.author?.id || toggleFollowMutation.isPending) return;
    requireAuth(() => {
      if (post.author) {
        toggleFollowMutation.mutate({
          userId: post.author.id,
          currentFollowing: isFollowing,
        });
      }
    });
  };

  /* MEDIA PROPS MEMO */
  const mediaProps = useMemo(
    () => ({
      post,
      isPlaying,
      isActive: isActive ?? false,
      onTogglePlay,
      screenWidth,
      screenHeight,
      tabBarHeight,
      onLike: handleLike,
      onDoubleTapLike: handleDoubleTapLike,
    }),
    [post, isPlaying, screenWidth, screenHeight, tabBarHeight, isActive],
  );

  return (
    <YStack height={screenHeight} width="100%" backgroundColor="black">
      {/* MEDIA */}
      <PostMedia {...mediaProps} />

      {/* OVERLAY — box-none so taps on empty area pass through to VideoPostCard gesture handler */}
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        backgroundColor="rgba(0,0,0,0.15)"
        pointerEvents="box-none"
      >
        <XStack
          position="absolute"
          bottom={Math.max(insets.bottom - 25)}
          padding="$4"
          alignItems="flex-end"
        >
          {/* LEFT SIDE */}
          <YStack flex={1} gap="$2">
            {/* PROFILE */}
            <XStack gap="$4" alignItems="center">
              <TouchableOpacity
                onPress={() => {
                  if (!post.author?.id) return;
                  requireAuth(() => router.push(`/guest?userId=${post.author.id}`));
                }}
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <AuthorAvatar username={post.author?.username} avatarUrl={post.author?.avatarUrl} />

                <Text color={colors.white} fontSize={16} fontWeight="500">
                  {post.author?.username ?? "user"}
                </Text>
              </TouchableOpacity>

              {!post.viewerState?.isOwner && (
                <TouchableOpacity
                  onPress={handleFollow}
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
                    {isFollowing ? "following" : "follow"}
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
                  <GestureDetector gesture={Gesture.Native()}>
                    <Pressable onPress={handleToggleExpanded}>
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
                  </GestureDetector>
                )}
              </XStack>
            )}
          </YStack>

          {/* RIGHT ACTIONS */}
          <YStack gap="$4">
            <YStack alignItems="center">
              <GestureDetector gesture={Gesture.Native()}>
                <Pressable onPress={handleLike}>
                  <Image
                    source={likedState ? likeIconActive : likeIcon}
                    width={30}
                    height={30}
                  />
                </Pressable>
              </GestureDetector>
              {!hideLikeCount && (
                <Text color={colors.white} fontSize={12}>
                  {likeCount}
                </Text>
              )}
            </YStack>

            <YStack alignItems="center">
              <GestureDetector gesture={Gesture.Native()}>
                <Pressable onPress={handleComment}>
                  <Image source={commentIcon} width={30} height={30} />
                </Pressable>
              </GestureDetector>
              <Text color={colors.white} fontSize={12}>{commentCount}</Text>
            </YStack>

            <YStack alignItems="center">
              <GestureDetector gesture={Gesture.Native()}>
                <Pressable onPress={handleBookmark}>
                  {isSavePending ? (
                    <View width={36} height={36} justifyContent="center" alignItems="center">
                      <ActivityIndicator size="large" color={colors.white} />
                    </View>
                  ) : (
                    <Image
                      source={isBookmarked ? bookmarkIconActive : bookmarkIcon}
                      width={30}
                      height={30}
                    />
                  )}
                </Pressable>
              </GestureDetector>
              <Text color={colors.white} fontSize={12}>{savedCount}</Text>
            </YStack>

            <GestureDetector gesture={Gesture.Native()}>
                <Pressable onPress={handleShare}>
                  <Image source={shareIcon} width={30} height={30} />
              </Pressable>
            </GestureDetector>

            <GestureDetector gesture={Gesture.Native()}>
                <Pressable onPress={handleOptions}>
                  <MoreHorizontal size={32} color={colors.white} />
              </Pressable>
            </GestureDetector>
          </YStack>
        </XStack>
      </YStack>

      {/* MODALS */}
      {commentsVisible && (
        <CommentsSheet
          visible={commentsVisible}
          onClose={() => setCommentsVisible(false)}
          postId={post.id}
        />
      )}
      {optionsVisible && (
        <OptionsModal
          visible={optionsVisible}
          onClose={() => setOptionsVisible(false)}
          onReportPost={() => {
            setOptionsVisible(false);
            setConfirmVisible(true);
          }}
        />
      )}
      {confirmVisible && (
        <ConfirmReportModal
          visible={confirmVisible}
          onClose={() => setConfirmVisible(false)}
          onConfirm={() => {
            setConfirmVisible(false);
            setReasonsVisible(true);
          }}
        />
      )}
      {reasonsVisible && (
        <ReportReasonsModal
          visible={reasonsVisible}
          onClose={() => setReasonsVisible(false)}
          onSelectReason={(reason) => {
            setReasonsVisible(false);
            reportMutation.mutate(
              { reason: reason as ReportReason, postId: post.id },
              {
                onSuccess: () => {
                  setSuccessVisible(true);
                  setSuccessType("success");
                  setSuccessTitle("Report Submitted");
                  setSuccessMessage("Thank you for your report. We'll review it shortly.");
                },
                onError: (err) => {
                  console.error("[ReportFlow] reason report failed:", err);
                  setSuccessVisible(true);
                  setSuccessType("failed");
                  setSuccessTitle("Something went wrong");
                  setSuccessMessage("Please try again later.");
                },
              }
            );
          }}
          onSelectOther={() => {
            setReasonsVisible(false);
            setOtherVisible(true);
          }}
        />
      )}
      {otherVisible && (
        <OtherReportModal
          visible={otherVisible}
          onClose={() => setOtherVisible(false)}
          onSubmit={(description) => {
            setOtherVisible(false);
            reportMutation.mutate(
              { reason: "OTHER" as ReportReason, postId: post.id, description },
              {
                onSuccess: () => {
                  setSuccessVisible(true);
                  setSuccessType("success");
                  setSuccessTitle("Report Submitted");
                  setSuccessMessage("Thank you for your report. We'll review it shortly.");
                },
                onError: (err) => {
                  console.error("[ReportFlow] other report failed:", err);
                  setSuccessVisible(true);
                  setSuccessType("failed");
                  setSuccessTitle("Something went wrong");
                  setSuccessMessage("Please try again later.");
                },
              }
            );
          }}
        />
      )}
      {shareVisible && (
        <ShareModal
          visible={shareVisible}
          onClose={() => setShareVisible(false)}
          post={post}
        />
      )}
      {successVisible && (
        <SuccessModal
          visible={successVisible}
          onClose={() => setSuccessVisible(false)}
          title={successTitle}
          message={successMessage}
          type={successType}
        />
      )}
      {foldersVisible && (
        <BookmarkFoldersModal
          visible={foldersVisible}
          savedFolderIds={savedFolderIds}
          onClose={() => setFoldersVisible(false)}
          onToggleFolder={handleToggleFolder}
          onCreateNew={() => {
            setFoldersVisible(false);
            setCreateVisible(true);
          }}
        />
      )}
      {createVisible && (
        <CreateFolderModal
          visible={createVisible}
          post={post}
          onClose={() => setCreateVisible(false)}
          onSave={(name, thumbnailUri) => {
            createFolder(name, thumbnailUri, {
              onSuccess: () => {
                setBookmarkFeedback({ visible: true, type: "success", title: "Saved", message: "Post saved to new folder." });
              },
              onError: () => {
                setBookmarkFeedback({ visible: true, type: "failed", title: "Failed to Save", message: "Please try again." });
              },
            });
          }}
        />
      )}
      {bookmarkFeedback.visible && (
        <SuccessModal
          visible={bookmarkFeedback.visible}
          onClose={() => setBookmarkFeedback((prev) => ({ ...prev, visible: false }))}
          title={bookmarkFeedback.title}
          message={bookmarkFeedback.message}
          type={bookmarkFeedback.type}
          autoClose
          duration={3000}
        />
      )}
      {AuthModal}
    </YStack>
  );
}

/*PREVENT RE-RENDERS */
export const PostCard = React.memo(
  PostCardComponent,
  (prev, next) =>
    prev.post.id === next.post.id &&
    prev.isPlaying === next.isPlaying &&
    prev.isActive === next.isActive &&
    prev.post.viewerState?.liked === next.post.viewerState?.liked &&
    prev.screenHeight === next.screenHeight &&
    prev.screenWidth === next.screenWidth &&
    prev.tabBarHeight === next.tabBarHeight,
);
