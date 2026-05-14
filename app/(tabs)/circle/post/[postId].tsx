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
  }>();

  const [commentText, setCommentText] = useState("");
  const [failedAvatarUrls, setFailedAvatarUrls] = useState<string[]>([]);

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
    if (!commentText.trim()) return;

    createCommentMutation.mutate(
      {
        postId: postId || "",
        text: commentText,
      },
      {
        onSuccess: () => {
          setCommentText("");
        },
      }
    );
  };

  const handleLikeComment = (commentId: string, currentLiked: boolean) => {
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
            paddingHorizontal="$3"
            paddingVertical="$2"
            gap="$2"
            alignItems="flex-end"
            borderTopWidth={1}
            borderTopColor="#EEE"
          >
            <YStack
              flex={1}
              borderRadius={20}
              borderWidth={1}
              borderColor="#DDD"
              paddingHorizontal="$3"
              paddingVertical="$1"
              backgroundColor="#F9F9F9"
            >
              <TextInput
                placeholder="Add a comment..."
                placeholderTextColor="#999"
                value={commentText}
                onChangeText={setCommentText}
                style={styles.textInput}
                numberOfLines={1}
              />
            </YStack>

            <TouchableOpacity
              onPress={handleCreateComment}
              disabled={!commentText.trim() || createCommentMutation.isPending}
            >
              <Ionicons
                name="send"
                size={20}
                color={commentText.trim() ? themeColors.primary : "#DDD"}
              />
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
    fontSize: 14,
    color: "#333",
    paddingVertical: 8,
  },
  loadMoreButton: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
