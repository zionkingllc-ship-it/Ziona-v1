import React, { useState } from "react";
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
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, XStack, YStack, Image } from "tamagui";
import { Ionicons } from "@expo/vector-icons";
import { usePostComments } from "@/hooks/usePostComments";
import { useCreateComment } from "@/hooks/useCreateComment";
import { useToggleCommentLike } from "@/hooks/useToggleCommentLike";
import { useCirclePostLike } from "@/hooks/useCirclePostLike";
import { AvatarWithInitials } from "@/components/ui/AvatarWithInitials";
import { useAuthStore } from "@/store/useAuthStore";
import * as ImagePicker from "expo-image-picker";
import themeColors from "@/constants/colors";

const formatDate = (dateString?: string): string => {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function CirclePostDetailScreen() {
  const router = useRouter();
  const {
    postId,
    circleId,
    userName,
    userAvatar,
    postText,
    postImage,
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
    postLikes?: string;
    postLiked?: string;
    postComments?: string;
    postCreatedAt?: string;
    anchorType?: string;
    anchorTitle?: string;
    anchorContent?: string;
    anchorMediaUrl?: string;
  }>();

  const [commentText, setCommentText] = useState("");
  const [commentImage, setCommentImage] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [failedAvatarUrls, setFailedAvatarUrls] = useState<string[]>([]);
  const currentUser = useAuthStore((state) => state.user);

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
  } = usePostComments(postId || "");

  const createCommentMutation = useCreateComment();
  const toggleCommentLikeMutation = useToggleCommentLike();

  const comments = commentsData?.pages.flatMap((page) => page.comments) || [];

  const handleCreateComment = async () => {
    if (!commentText.trim() || posting) return;
    setPosting(true);

    createCommentMutation.mutate(
      {
        postId: postId || "",
        text: commentText,
      },
      {
        onSettled: () => {
          setPosting(false);
        },
        onSuccess: () => {
          setCommentText("");
        },
      }
    );
  };

  const handleLikeComment = (commentId: string, currentLiked: boolean) => {
    if (toggleCommentLikeMutation.isPending) return;
    toggleCommentLikeMutation.mutate({ commentId, currentLiked });
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <XStack
        paddingHorizontal="$3"
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
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <YStack padding="$3" gap="$3" borderBottomWidth={1} borderBottomColor="#EEE">
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

            {postImage && (
              <Image
                source={{ uri: postImage }}
                width="100%"
                height={200}
                borderRadius={12}
                resizeMode="cover"
              />
            )}

            {anchorType && (
              <View style={styles.anchorRefCard}>
                <Text fontSize={11} color="#999" marginBottom={4}>
                  From {anchorTitle || "Anchor"}
                </Text>
                {anchorType === "image" && anchorMediaUrl ? (
                  <Image
                    source={{ uri: anchorMediaUrl }}
                    width="100%"
                    height={140}
                    borderRadius={8}
                    resizeMode="cover"
                  />
                ) : anchorType === "video" && anchorMediaUrl ? (
                  <View style={styles.anchorMediaPlaceholder}>
                    <Ionicons name="play-circle" size={32} color="#742092" />
                    <Text fontSize={12} color="#666">Video</Text>
                  </View>
                ) : null}
                {anchorContent && (
                  <Text
                    fontSize={13}
                    color="#555"
                    lineHeight={18}
                    numberOfLines={3}
                    style={{ marginTop: anchorType === "text" ? 0 : 8 }}
                  >
                    {anchorContent}
                  </Text>
                )}
              </View>
            )}

            <XStack gap="$4" paddingTop="$2" borderTopWidth={1} borderTopColor="#EEE">
              <TouchableOpacity onPress={handleToggleLike} disabled={togglingLike}>
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
                <Ionicons name="chatbubble" size={16} color="#666" />
                <Text fontSize={12} color="#666">
                  {postComments} {Number(postComments) === 1 ? "comment" : "comments"}
                </Text>
              </XStack>
            </XStack>
          </YStack>

          <YStack paddingHorizontal="$3" paddingVertical="$2">
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
                <YStack
                  key={comment.id}
                  gap="$2"
                  paddingBottom="$2"
                  borderBottomWidth={1}
                  borderBottomColor="#F0F0F0"
                >
                  <XStack alignItems="center" gap="$2">
                    <AvatarWithInitials
                      uri={comment.user.avatarUrl}
                      name={comment.user.username}
                      size={32}
                      failedUris={failedAvatarUrls}
                      setFailedUris={setFailedAvatarUrls}
                    />
                    <YStack gap={2} flex={1}>
                      <Text fontSize={12} fontWeight="600">
                        {comment.user.username}
                      </Text>
                      <Text fontSize={11} color="#999">
                        {formatDate(comment.createdAt)}
                      </Text>
                    </YStack>
                  </XStack>

                  <Text fontSize={13} color="#333" lineHeight={18} paddingLeft="$4">
                    {comment.text}
                  </Text>

                  <XStack gap="$3" paddingLeft="$4" alignItems="center">
                    <TouchableOpacity
                      onPress={() => handleLikeComment(comment.id, comment.viewerState?.liked ?? false)}
                      disabled={toggleCommentLikeMutation.isPending}
                    >
                      <XStack alignItems="center" gap="$1">
                        <Ionicons
                          name={comment.viewerState?.liked ? "heart" : "heart-outline"}
                          size={14}
                          color={comment.viewerState?.liked ? themeColors.primary : "#999"}
                        />
                        <Text fontSize={11} color="#999">
                          {comment.stats.likesCount}
                        </Text>
                      </XStack>
                    </TouchableOpacity>
                  </XStack>
                </YStack>
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
          <XStack
            paddingHorizontal="$2"
            paddingVertical="$2"
            gap="$2"
            alignItems="flex-end"
            borderTopWidth={1}
            borderTopColor="#EEE"
          >
            <Pressable
              onPress={async () => {
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ["images"],
                  allowsEditing: true,
                  quality: 0.8,
                });
                if (!result.canceled && result.assets?.[0]?.uri) {
                  setCommentImage(result.assets[0].uri);
                }
              }}
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
              placeholder="Add a comment..."
              placeholderTextColor="#999"
              value={commentText}
              onChangeText={setCommentText}
              style={styles.textInput}
              multiline
            />

            <TouchableOpacity
              onPress={handleCreateComment}
              disabled={!commentText.trim() || posting}
              style={{ paddingVertical: 8 }}
            >
              <View
                style={{
                  backgroundColor: commentText.trim() && !posting ? themeColors.primary : "#CCC",
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

  anchorRefCard: {
    backgroundColor: "#F5F3F7",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E4C0F1",
    maxHeight: 200,
    overflow: "hidden",
  },

  anchorMediaPlaceholder: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0ECF3",
    borderRadius: 8,
    gap: 4,
  },
});
