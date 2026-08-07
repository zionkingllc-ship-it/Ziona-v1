import React, { useState, useCallback, useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Pressable,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useRequireCircleMembership } from "@/hooks/useRequireCircleMembership";
import { useCircleMembership } from "@/hooks/useCircles";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image as ExpoImage } from "expo-image";
import { Text, XStack, YStack, Image } from "tamagui";
import { Ionicons } from "@expo/vector-icons";
import { useCirclePostComments } from "@/hooks/useCirclePostComments";
import { useCreateCircleComment } from "@/hooks/useCreateCircleComment";
import { useToggleCircleCommentLike } from "@/hooks/useToggleCircleCommentLike";
import { useDeleteCircleComment } from "@/hooks/useDeleteCircleComment";
import { useCirclePostLike } from "@/hooks/useCirclePostLike";
import { AvatarWithInitials } from "@/components/ui/AvatarWithInitials";
import { useAuthStore } from "@/store/useAuthStore";
import * as ImagePicker from "expo-image-picker";
import themeColors from "@/constants/colors";
import SuccessModal from "@/components/ui/modals/successModal";
import { keyboardBehavior } from "@/constants/platform";
import { CircleCommentItem } from "@/components/circles/CircleCommentItem";
import { MentionSuggestions } from "@/components/comments/MentionSuggestions";
import type { MentionUser } from "@/components/comments/MentionSuggestions";

const formatDate = (dateString?: string): string => {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function CirclePostDetailScreen() {
  const router = useRouter();
  const { requireAuth } = useRequireAuth();
  const {
    postId,
    circleId,
    userName,
    userAvatar,
    postText,
    postImage,
    postMediaUrl,
    postLikes,
    postLiked,
    postComments,
    postCreatedAt,
    anchorType,
    anchorTitle,
    anchorContent,
    anchorMediaUrl,
  } = useLocalSearchParams<{
    postId?: string;
    circleId?: string;
    userName?: string;
    userAvatar?: string;
    postText?: string;
    postImage?: string;
    postMediaUrl?: string;
    postLikes?: string;
    postLiked?: string;
    postComments?: string;
    postCreatedAt?: string;
    anchorType?: string;
    anchorTitle?: string;
    anchorContent?: string;
    anchorMediaUrl?: string;
  }>();

  const isVideo = !!postMediaUrl && /\.(mp4|mov|avi|webm|mkv)(\?|$)/i.test(postMediaUrl);

  const [commentText, setCommentText] = useState("");
  const [commentImage, setCommentImage] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [failedAvatarUrls, setFailedAvatarUrls] = useState<string[]>([]);
  const [postImageError, setPostImageError] = useState(false);
  const [videoThumbError, setVideoThumbError] = useState(false);
  const [anchorImageError, setAnchorImageError] = useState(false);
  const [showPermissionAlert, setShowPermissionAlert] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ commentId: string; username: string } | null>(null);
  const [mentionSearch, setMentionSearch] = useState<string | null>(null);
  const currentUser = useAuthStore((state) => state.user);
  const { isJoined } = useCircleMembership(circleId || "");
  const { requireMembership, MembershipModal, isAuthenticated } =
    useRequireCircleMembership(circleId || "", isJoined);

  const detectMention = useCallback((text: string) => {
    const lastAtIndex = text.lastIndexOf("@");
    if (lastAtIndex === -1) return null;
    const textAfterAt = text.slice(lastAtIndex + 1);
    if (textAfterAt.includes(" ") || textAfterAt.includes("\n")) return null;
    return textAfterAt;
  }, []);

  const handleTextChange = useCallback((text: string) => {
    setCommentText(text);
    const mention = detectMention(text);
    setMentionSearch(mention);
  }, [detectMention]);

  const handleSelectUser = useCallback((user: MentionUser) => {
    const lastAtIndex = commentText.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      const textBeforeMention = commentText.slice(0, lastAtIndex);
      const newText = `${textBeforeMention}@${user.username} `;
      setCommentText(newText);
    }
    setMentionSearch(null);
  }, [commentText]);

  const { isLiked, likeCount, handleToggleLike, togglingLike } = useCirclePostLike(
    postId || "",
    postLiked === "1",
    Number(postLikes) || 0,
  );

  const {
    data: commentsData,
    isLoading: isLoadingComments,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch: refetchComments,
  } = useCirclePostComments(postId || "");

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchComments();
    } catch { console.warn("[post] refresh comments failed"); } finally {
      setRefreshing(false);
    }
  }, [refetchComments]);

  const createCommentMutation = useCreateCircleComment();
  const toggleCommentLikeMutation = useToggleCircleCommentLike();
  const deleteCommentMutation = useDeleteCircleComment();

  const comments = commentsData?.pages?.flatMap((page) => page.comments) || [];

  const handleCreateComment = () => {
    requireMembership(() => handleCreateCommentAction());
  };

  const handleCreateCommentAction = async () => {
    if (!commentText.trim() || posting) return;
    setPosting(true);

    createCommentMutation.mutate(
      {
        postId: postId || "",
        text: commentText,
        parentCommentId: replyingTo?.commentId || undefined,
      },
      {
        onSettled: () => {
          setPosting(false);
          setReplyingTo(null);
        },
        onSuccess: () => {
          setCommentText("");
        },
      }
    );
  };

  const handleLikeComment = (commentId: string, currentLiked: boolean) => {
    requireMembership(() => {
      if (toggleCommentLikeMutation.isPending) return;
      toggleCommentLikeMutation.mutate({ commentId, currentLiked });
    });
  };

  const handleDeleteComment = (commentId: string) => {
    deleteCommentMutation.mutate(commentId);
  };

  const handleReply = (commentId: string, username: string) => {
    requireMembership(() => setReplyingTo({ commentId, username }));
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setCommentText("");
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleAnchorMediaTap = () => {
    if (anchorType === "video" && anchorMediaUrl) {
      const path = `/circleVideoViewer?video=${encodeURIComponent(anchorMediaUrl)}`;
      router.push(path as any);
    } else if (anchorType === "image" && anchorMediaUrl) {
      const path = `/circleImageViewer?image=${encodeURIComponent(anchorMediaUrl)}`;
      router.push(path as any);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <XStack
        paddingLeft={20}
        paddingRight="$3"
        paddingVertical="$2"
        justifyContent="space-between"
        alignItems="center"
        borderBottomWidth={1}
        borderBottomColor="#EEE"
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text fontSize={16} fontWeight="600">
          Post Details
        </Text>
        <View style={{ width: 24 }} />
      </XStack>

      <KeyboardAvoidingView
        behavior={keyboardBehavior()}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          <YStack padding="$3" gap="$3">
            <XStack alignItems="center" gap="$2">
              <AvatarWithInitials
                uri={userAvatar}
                name={userName}
                size={40}
                failedUris={failedAvatarUrls}
                setFailedUris={setFailedAvatarUrls}
              />
              <YStack gap={2}>
                <Text fontSize={14} fontWeight="600">
                  {userName}
                </Text>
                <Text fontSize={12} color="#888">
                  {formatDate(postCreatedAt)}
                </Text>
              </YStack>
            </XStack>

            {postText && (
              <Text fontSize={14} color="#333" lineHeight={20}>
                {postText}
              </Text>
            )}

            {isVideo && postMediaUrl && (
              <Pressable onPress={() => router.push({ pathname: "/postVideoViewer", params: { video: postMediaUrl } })}>
                <View style={{ height: 200, borderRadius: 12, backgroundColor: "#000", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
                  {(postImage || postMediaUrl) && !videoThumbError ? (
                    <>
                      <ExpoImage source={{ uri: postImage || postMediaUrl }} style={{ width: "100%", height: 200 }} contentFit="cover" onError={() => setVideoThumbError(true)} />
                      <View style={{ position: "absolute", width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" }}>
                        <Ionicons name="play" size={26} color="#FFF" />
                      </View>
                    </>
                  ) : (
                    <>
                      <Ionicons name="videocam" size={40} color="#FFF" />
                      <Text fontFamily="$body" color="#FFF" fontSize={14}>Tap to view video</Text>
                    </>
                  )}
                </View>
              </Pressable>
            )}

            {!isVideo && (postImage || postMediaUrl) && !postImageError && (
              <Pressable onPress={() => router.push({ pathname: "/circleImageViewer", params: { image: postImage || postMediaUrl } })}>
                <ExpoImage
                  source={{ uri: postImage || postMediaUrl }}
                  style={{ width: "100%", height: 200, borderRadius: 12 }}
                  contentFit="cover"
                  onError={() => setPostImageError(true)}
                />
              </Pressable>
            )}
            {!isVideo && (postImage || postMediaUrl) && postImageError && (
              <View style={{ height: 200, borderRadius: 12, backgroundColor: "#F0F0F0", justifyContent: "center", alignItems: "center" }}>
                <Ionicons name="image-outline" size={40} color="#999" />
                <Text fontFamily="$body" fontSize={13} color="#999" marginTop={4}>Image unavailable</Text>
              </View>
            )}

            {anchorType && (
              (anchorContent || anchorTitle) ? (
                <Pressable onPress={() => handleAnchorMediaTap()}>
                  <View style={{ borderRadius: 12, marginTop: 6, padding: 12, backgroundColor: "#0B0F2F" }}>
                    {anchorTitle && (
                      <Text fontFamily="$body" fontSize={11} color="rgba(255,255,255,0.6)" marginBottom={4}>
                        From {anchorTitle}
                      </Text>
                    )}
                    <Text fontFamily="$body" color="#FFF" fontSize={13} numberOfLines={3}>
                      {anchorContent || ""}
                    </Text>
                  </View>
                </Pressable>
              ) : anchorType === "image" && anchorMediaUrl && !anchorImageError ? (
                <Pressable onPress={() => handleAnchorMediaTap()}>
                  <View style={{ height: 120, borderRadius: 12, overflow: "hidden", marginTop: 6 }}>
                    <ExpoImage source={{ uri: anchorMediaUrl }} style={{ width: "100%", height: 120, borderRadius: 12 }} contentFit="cover" onError={() => setAnchorImageError(true)} />
                  </View>
                </Pressable>
              ) : anchorType === "image" && anchorMediaUrl && anchorImageError ? (
                <Pressable onPress={() => handleAnchorMediaTap()}>
                  <View style={{ height: 120, borderRadius: 12, marginTop: 6, backgroundColor: "#0B0F2F", justifyContent: "center", alignItems: "center" }}>
                    <Ionicons name="image-outline" size={28} color="#FFF" />
                    <Text fontFamily="$body" color="#FFF" fontSize={11} marginTop={2}>Image unavailable</Text>
                  </View>
                </Pressable>
              ) : anchorType === "video" && anchorMediaUrl ? (
                <Pressable onPress={() => handleAnchorMediaTap()}>
                  <View style={{ height: 100, borderRadius: 12, marginTop: 6, backgroundColor: "#000", justifyContent: "center", alignItems: "center", gap: 6 }}>
                    <Ionicons name="videocam" size={24} color="#FFF" />
                    <Text fontFamily="$body" color="#FFF" fontSize={12}>Tap to view video</Text>
                  </View>
                </Pressable>
              ) : null
            )}

            <XStack gap="$4" paddingTop="$2">
              <TouchableOpacity onPress={() => requireMembership(handleToggleLike)} disabled={togglingLike}>
                <XStack alignItems="center" gap="$1">
                  <Ionicons
                    name={isLiked ? "heart" : "heart-outline"}
                    size={16}
                    color={isLiked ? themeColors.primary : "#666"}
                  />
                  <Text fontSize={12} color="#666">
                    {likeCount} {likeCount === 1 ? "like" : "likes"}
                  </Text>
                </XStack>
              </TouchableOpacity>
              <XStack alignItems="center" gap="$1">
                <Ionicons name="chatbubble-outline" size={16} color="#666" />
                <Text fontSize={12} color="#666">
                  {postComments} {Number(postComments) === 1 ? "comment" : "comments"}
                </Text>
              </XStack>
            </XStack>
          </YStack>

          <YStack paddingHorizontal="$3" paddingVertical="$2" borderTopWidth={1} borderTopColor="#EEE">
            <Text fontSize={14} fontWeight="600" color="#333">
              Comments
            </Text>
          </YStack>

          {isLoadingComments ? (
            <YStack flex={1} justifyContent="center" alignItems="center" paddingVertical="$4">
              <ActivityIndicator color={themeColors.primary} size="large" />
            </YStack>
          ) : comments.length === 0 ? (
            <YStack paddingHorizontal="$3" paddingVertical="$4" alignItems="center">
              <Text fontSize={14} color="#999">
                No comments yet. Be the first to comment!
              </Text>
            </YStack>
          ) : (
            <YStack paddingHorizontal="$3" gap="$3" paddingVertical="$2">
              {comments.map((comment) => (
                <CircleCommentItem
                  key={comment.id}
                  comment={comment}
                  onLike={handleLikeComment}
                  onDelete={handleDeleteComment}
                  onReply={handleReply}
                  isPending={toggleCommentLikeMutation.isPending}
                />
              ))}

              {hasNextPage && (
                <TouchableOpacity
                  onPress={handleLoadMore}
                  disabled={isFetchingNextPage}
                  style={styles.loadMoreButton}
                >
                  {isFetchingNextPage ? (
                    <ActivityIndicator color={themeColors.primary} />
                  ) : (
                    <Text fontSize={13} color={themeColors.primary} fontWeight="600">
                      Load more comments
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </YStack>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        <View style={styles.inputContainer}>
          {replyingTo && (
            <XStack paddingHorizontal="$3" paddingVertical="$2" backgroundColor="#f5f5f5" gap="$2" alignItems="center">
              <Text fontSize={12} color="#999">Replying to <Text fontWeight="600">@{replyingTo.username}</Text></Text>
              <TouchableOpacity onPress={handleCancelReply}>
                <Text fontSize={12} color="#6C2BD9">Cancel</Text>
              </TouchableOpacity>
            </XStack>
          )}
          {mentionSearch !== null && (
            <MentionSuggestions
              searchText={mentionSearch}
              onSelectUser={handleSelectUser}
              onViewProfile={(user) => requireAuth(() => router.push(`/guest?userId=${user.id}`))}
            />
          )}
          <XStack
            paddingHorizontal="$2"
            paddingVertical="$2"
            gap="$2"
            alignItems="flex-end"
            borderTopWidth={1}
            borderTopColor="#EEE"
          >
            <Pressable
              onPress={() =>
                requireMembership(async () => {
                  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                  if (status !== "granted") {
                    setShowPermissionAlert(true);
                    return;
                  }
                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ["images"],
                    allowsEditing: true,
                    quality: 0.8,
                  });
                  if (!result.canceled && result.assets?.[0]?.uri) {
                    setCommentImage(result.assets[0].uri);
                  }
                })
              }
              style={{ paddingVertical: 8 }}
            >
              {currentUser?.avatarUrl ? (
                <AvatarWithInitials
                  uri={currentUser?.avatarUrl}
                  name={currentUser?.username}
                  size={28}
                  failedUris={failedAvatarUrls}
                  setFailedUris={setFailedAvatarUrls}
                />
              ) : (
                <AvatarWithInitials
                  uri={null}
                  name={currentUser?.username || "You"}
                  size={28}
                  failedUris={failedAvatarUrls}
                  setFailedUris={setFailedAvatarUrls}
                />
              )}
            </Pressable>

            <TextInput
              placeholder={
                isAuthenticated
                  ? replyingTo
                    ? `Reply to ${replyingTo.username}...`
                    : "Add a comment..."
                  : "Login to comment..."
              }
              placeholderTextColor="#999"
              value={commentText}
              onChangeText={handleTextChange}
              style={styles.textInput}
              multiline
              editable={isAuthenticated}
            />

            <TouchableOpacity
              onPress={handleCreateComment}
              disabled={!isAuthenticated || !commentText.trim() || posting}
              style={{ paddingVertical: 8 }}
            >
              <View
                style={{
                  backgroundColor:
                    isAuthenticated && commentText.trim() && !posting
                      ? themeColors.primary
                      : "#CCC",
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
              >
                {posting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text color="#FFF" fontSize={13}>
                    Post
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </XStack>
        </View>
      </KeyboardAvoidingView>

      <SuccessModal
        visible={showPermissionAlert}
        onClose={() => setShowPermissionAlert(false)}
        title="Permission required"
        message="Please grant media library access in Settings to attach images."
        type="warning"
        autoClose={false}
        withButton
        buttonText="OK"
        onButtonPress={() => setShowPermissionAlert(false)}
      />
      {MembershipModal}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  scrollView: {
    flex: 1,
  },
  inputContainer: {
    backgroundColor: "#FFF",
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    paddingVertical: 8,
    minHeight: 36,
    maxHeight: 120,
  },
  loadMoreButton: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
