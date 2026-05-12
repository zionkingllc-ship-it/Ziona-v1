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
import type { CirclePost } from "@/constants/mockCircles";
import themeColors from "@/constants/colors";

// Temporary: Use mock data. In production, fetch from API
const MOCK_CIRCLE_POST: CirclePost = {
  id: "post-1",
  user: {
    name: "Sarah Johnson",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  createdAt: "2 hours ago",
  text: "Just finished an amazing Bible study on faith and trust. God's word is so powerful and transformative. Feeling grateful for this circle of believers 🙏",
  image: undefined,
  likes: 24,
  comments: 8,
};

export default function CirclePostDetailScreen() {
  const router = useRouter();
  const { postId, circleId } = useLocalSearchParams<{
    postId?: string;
    circleId?: string;
  }>();

  const [commentText, setCommentText] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Fetch comments
  const {
    data: commentsData,
    isLoading: isLoadingComments,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = usePostComments(postId || "");

  // Create comment mutation
  const createCommentMutation = useCreateComment();

  // Like comment mutation
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

  const handleLikeComment = (commentId: string) => {
    toggleCommentLikeMutation.mutate({ commentId });
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
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
          {/* Post Content */}
          <YStack padding="$3" gap="$3" borderBottomWidth={1} borderBottomColor="#EEE">
            {/* Post Header */}
            <XStack alignItems="center" gap="$2">
              <Image
                source={{ uri: MOCK_CIRCLE_POST.user.avatar }}
                width={40}
                height={40}
                borderRadius={20}
              />
              <YStack gap={2}>
                <Text fontSize={14} fontWeight="600">
                  {MOCK_CIRCLE_POST.user.name}
                </Text>
                <Text fontSize={12} color="#888">
                  {MOCK_CIRCLE_POST.createdAt}
                </Text>
              </YStack>
            </XStack>

            {/* Post Text */}
            {MOCK_CIRCLE_POST.text && (
              <Text fontSize={14} color="#333" lineHeight={20}>
                {MOCK_CIRCLE_POST.text}
              </Text>
            )}

            {/* Post Image */}
            {MOCK_CIRCLE_POST.image && (
              <Image
                source={{ uri: MOCK_CIRCLE_POST.image }}
                width="100%"
                height={200}
                borderRadius={12}
                resizeMode="cover"
              />
            )}

            {/* Stats */}
            <XStack gap="$4" paddingTop="$2" borderTopWidth={1} borderTopColor="#EEE">
              <XStack alignItems="center" gap="$1">
                <Ionicons name="heart" size={16} color={themeColors.primary} />
                <Text fontSize={12} color="#666">
                  {MOCK_CIRCLE_POST.likes} likes
                </Text>
              </XStack>
              <XStack alignItems="center" gap="$1">
                <Ionicons name="chatbubble" size={16} color="#666" />
                <Text fontSize={12} color="#666">
                  {MOCK_CIRCLE_POST.comments} comments
                </Text>
              </XStack>
            </XStack>
          </YStack>

          {/* Comments Section Header */}
          <YStack paddingHorizontal="$3" paddingVertical="$2">
            <Text fontSize={14} fontWeight="600" color="#333">
              Comments
            </Text>
          </YStack>

          {/* Comments List */}
          {isLoadingComments ? (
            <YStack
              flex={1}
              justifyContent="center"
              alignItems="center"
              paddingVertical="$4"
            >
              <ActivityIndicator color={themeColors.primary} size="large" />
            </YStack>
          ) : comments.length === 0 ? (
            <YStack
              paddingHorizontal="$3"
              paddingVertical="$4"
              alignItems="center"
            >
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
                  {/* Comment Header */}
                  <XStack alignItems="center" gap="$2">
                    <Image
                      source={{ uri: comment.user.avatarUrl }}
                      width={32}
                      height={32}
                      borderRadius={16}
                    />
                    <YStack gap={2} flex={1}>
                      <Text fontSize={12} fontWeight="600">
                        {comment.user.username}
                      </Text>
                      <Text fontSize={11} color="#999">
                        {comment.createdAt}
                      </Text>
                    </YStack>
                  </XStack>

                  {/* Comment Text */}
                  <Text fontSize={13} color="#333" lineHeight={18} paddingLeft="$4">
                    {comment.text}
                  </Text>

                  {/* Comment Actions */}
                  <XStack gap="$3" paddingLeft="$4" alignItems="center">
                    <TouchableOpacity
                      onPress={() => handleLikeComment(comment.id)}
                    >
                      <XStack alignItems="center" gap="$1">
                        <Ionicons
                          name={
                            comment.viewerState?.liked
                              ? "heart"
                              : "heart-outline"
                          }
                          size={14}
                          color={
                            comment.viewerState?.liked
                              ? themeColors.primary
                              : "#999"
                          }
                        />
                        <Text fontSize={11} color="#999">
                          {comment.stats.likesCount}
                        </Text>
                      </XStack>
                    </TouchableOpacity>

                    {comment.stats.repliesCount > 0 && (
                      <Text fontSize={11} color={themeColors.primary}>
                        {comment.stats.repliesCount} replies
                      </Text>
                    )}
                  </XStack>
                </YStack>
              ))}

              {/* Load More Button */}
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

          {/* Spacing for input */}
          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Comment Input */}
        <View style={styles.inputContainer}>
          <XStack
            paddingHorizontal="$3"
            paddingVertical="$2"
            gap="$2"
            alignItems="flex-end"
            borderTopWidth={1}
            borderTopColor="#EEE"
          >
            <TouchableOpacity style={{ paddingBottom: 4 }}>
              <Ionicons name="add-circle-outline" size={24} color="#999" />
            </TouchableOpacity>

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
                color={
                  commentText.trim() ? themeColors.primary : "#DDD"
                }
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
