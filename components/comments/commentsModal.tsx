import BaseModal from "@/components/ui/modals/BaseModal";
import colors from "@/constants/colors";
import { useCreateComment } from "@/hooks/useCreateComment";
import { usePostComments } from "@/hooks/usePostComments";
import { useToggleCommentLike } from "@/hooks/useToggleCommentLike";
import { useCommentReplies } from "@/hooks/useCommentReplies";
import { MentionSuggestions } from "./MentionSuggestions";
import { Heart } from "@tamagui/lucide-icons";
import { Comment } from "@/services/graphQL/mutation/actions/comments";
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Dimensions,
  FlatList,
  Keyboard,
  LayoutChangeEvent,
  Platform,
  Pressable,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Image, Text, View, XStack, YStack } from "tamagui";

const { height } = Dimensions.get("window");
const likeIconActive = require("@/assets/images/likeIcon2.png");

type Props = {
  visible: boolean;
  onClose: () => void;
  postId: string;
};

const EMOJIS = ["😀", "🥰", "😂", "😳", "😌", "😁", "🥺", "😏", "😬"];

interface MentionUser {
  id: string;
  username: string;
  avatarUrl?: string | null;
}

interface ReplyState {
  commentId: string | null;
  username: string | null;
}

export function CommentsSheet({ visible, onClose, postId }: Props) {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [bottomHeight, setBottomHeight] = useState(10);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [failedAvatarUrls, setFailedAvatarUrls] = useState<string[]>([]);
  const [mentionSearch, setMentionSearch] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ReplyState>({ commentId: null, username: null });

  const inputRef = useRef<TextInput>(null);

  const keyboardHeight = useSharedValue(0);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = usePostComments(postId, visible);
  const createCommentMutation = useCreateComment();
  const toggleLikeMutation = useToggleCommentLike();

  const comments = data?.pages.flatMap((page) => page.comments) || [];

  const detectMention = useCallback((text: string) => {
    const lastAtIndex = text.lastIndexOf("@");
    if (lastAtIndex === -1) return null;
    const textAfterAt = text.slice(lastAtIndex + 1);
    if (textAfterAt.includes(" ") || textAfterAt.includes("\n")) return null;
    return textAfterAt;
  }, []);

  const handleTextChange = useCallback((text: string) => {
    setInputValue(text);
    const mention = detectMention(text);
    setMentionSearch(mention);
  }, [detectMention]);

  const handleSelectUser = useCallback((user: MentionUser) => {
    const lastAtIndex = inputValue.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      const textBeforeMention = inputValue.slice(0, lastAtIndex);
      const newText = `${textBeforeMention}@${user.username} `;
      setInputValue(newText);
    }
    setMentionSearch(null);
    inputRef.current?.focus();
  }, [inputValue]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      keyboardHeight.value = withTiming(e.endCoordinates.height, { duration: 250 });
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      keyboardHeight.value = withTiming(0, { duration: 250 });
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: Platform.OS === "android" ? -keyboardHeight.value : 0 }],
  }));

  const toggleLike = (commentId: string, currentLiked: boolean) => {
    toggleLikeMutation.mutate({ commentId, currentLiked });
  };

  const startReply = (commentId: string, username: string) => {
    setReplyingTo({ commentId, username });
    setInputValue(`@${username} `);
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyingTo({ commentId: null, username: null });
    setInputValue("");
  };

  const addComment = () => {
    if (!inputValue.trim()) return;

    const text = inputValue.trim();
    setInputValue("");
    setReplyingTo({ commentId: null, username: null });
    inputRef.current?.blur();

    createCommentMutation.mutate(
      { postId, text, parentCommentId: replyingTo.commentId || undefined },
      {
        onError: () => {
          setInputValue(text);
        },
      },
    );
  };

  const addEmoji = (emoji: string) => {
    if (inputRef.current) inputRef.current.focus();
    setInputValue((prev) => prev + emoji);
  };

  const onBottomLayout = (e: LayoutChangeEvent) => {
    setBottomHeight(e.nativeEvent.layout.height);
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  return (
    <BaseModal visible={visible} onClose={onClose} alignBottom>
      <Animated.View
        style={[
          { height: height * 0.7, backgroundColor: "white", borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: "hidden" },
          sheetAnimatedStyle,
        ]}
      >
        <YStack padding="$4" borderBottomWidth={1} borderColor="#eee" alignItems="center">
          <Text fontFamily={"$body"} fontWeight="600" fontSize="$4">
            Comments
          </Text>
        </YStack>

        <View style={{ flex: 1 }}>
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 16, paddingBottom: bottomHeight }}
            renderItem={({ item }) => (
              <CommentItem
                comment={item}
                expandedComments={expandedComments}
                setExpandedComments={setExpandedComments}
                expandedReplies={expandedReplies}
                toggleReplies={toggleReplies}
                failedAvatarUrls={failedAvatarUrls}
                setFailedAvatarUrls={setFailedAvatarUrls}
                toggleLike={toggleLike}
                startReply={startReply}
                toggleLikeMutation={toggleLikeMutation}
              />
            )}
            onEndReached={() => hasNextPage && fetchNextPage()}
            onEndReachedThreshold={0.5}
            ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={{ padding: 10 }} /> : null}
          />
        </View>

        <YStack borderTopWidth={1} borderColor="#eee" onLayout={onBottomLayout}>
          {replyingTo.username && (
            <XStack paddingHorizontal="$3" paddingVertical="$2" backgroundColor="#f5f5f5" gap="$2" alignItems="center">
              <Text fontSize={12} color={colors.gray}>Replying to @{replyingTo.username}</Text>
              <TouchableOpacity onPress={cancelReply}>
                <Text fontSize={12} color={colors.primary}>Cancel</Text>
              </TouchableOpacity>
            </XStack>
          )}

          {mentionSearch !== null && (
            <MentionSuggestions searchText={mentionSearch} onSelectUser={handleSelectUser} />
          )}

          <XStack
            padding="$1"
            gap="$2"
            alignItems="center"
            backgroundColor="#FAF9FA"
            borderWidth={1}
            borderColor="#EEEBEF"
            marginHorizontal={10}
            paddingHorizontal={14}
            borderRadius={8}
            marginTop={10}
            marginBottom={isFocused ? 10 : 20}
            minHeight={43}
          >
            <TextInput
              ref={inputRef}
              multiline
              placeholder={replyingTo.username ? `Reply to @${replyingTo.username}...` : "Join the conversation..."}
              placeholderTextColor="#836F8B"
              value={inputValue}
              onChangeText={handleTextChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              maxLength={500}
              style={{ flex: 1, fontFamily: "$body" }}
            />
            <TouchableOpacity onPress={addComment} disabled={createCommentMutation.isPending || !inputValue.trim()}>
              <Image
                source={require("@/assets/images/sendIcon.png")}
                width={30}
                height={30}
                opacity={createCommentMutation.isPending || !inputValue.trim() ? 0.5 : 1}
              />
            </TouchableOpacity>
          </XStack>

          <XStack paddingHorizontal="$3" paddingVertical="$2" gap="$2" flexWrap="wrap" justifyContent="flex-start">
            {EMOJIS.map((emoji) => (
              <Pressable key={emoji} onPress={() => addEmoji(emoji)} hitSlop={8}>
                <Text fontSize={24}>{emoji}</Text>
              </Pressable>
            ))}
          </XStack>
        </YStack>
      </Animated.View>
    </BaseModal>
  );
}

function CommentItem({
  comment,
  expandedComments,
  setExpandedComments,
  expandedReplies,
  toggleReplies,
  failedAvatarUrls,
  setFailedAvatarUrls,
  toggleLike,
  startReply,
  toggleLikeMutation,
}: {
  comment: Comment;
  expandedComments: Set<string>;
  setExpandedComments: React.Dispatch<React.SetStateAction<Set<string>>>;
  expandedReplies: Set<string>;
  toggleReplies: (id: string) => void;
  failedAvatarUrls: string[];
  setFailedAvatarUrls: React.Dispatch<React.SetStateAction<string[]>>;
  toggleLike: (id: string, liked: boolean) => void;
  startReply: (id: string, username: string) => void;
  toggleLikeMutation: any;
}) {
  const isExpanded = expandedComments.has(comment.id);
  const areRepliesExpanded = expandedReplies.has(comment.id);
  const shouldTruncate = comment.text.length > 80;
  const displayText = isExpanded || !shouldTruncate ? comment.text : comment.text.slice(0, 80) + "...";

  const handleAvatarError = (url: string | undefined | null) => {
    if (url) {
      setFailedAvatarUrls((prev) => Array.from(new Set([...prev, url])));
    }
  };

  return (
    <View paddingVertical="$3" borderBottomWidth={1} borderBottomColor="#f0f0f0">
      <XStack justifyContent="space-between">
        <XStack gap="$2" flex={1}>
          <Image
            source={
              comment.user?.avatarUrl && comment.user.avatarUrl.trim() && !failedAvatarUrls.includes(comment.user.avatarUrl)
                ? { uri: comment.user.avatarUrl }
                : { uri: "https://i.pravatar.cc/100?d=mp" }
            }
            width={36}
            height={36}
            borderRadius={18}
            onError={() => handleAvatarError(comment.user?.avatarUrl)}
          />
          <YStack flex={1}>
            <XStack gap="$2" alignItems="center">
              <Text fontWeight="600" fontFamily="$body" fontSize={14}>{comment.user?.username || "User"}</Text>
              <Text color="#999" fontFamily="$body" fontSize={11}>{formatDate(comment.createdAt)}</Text>
            </XStack>

            <Text fontSize={13} fontFamily="$body" marginTop={4}>{displayText}</Text>

            {shouldTruncate && !isExpanded && (
              <TouchableOpacity onPress={() => setExpandedComments((prev) => new Set([...prev, comment.id]))}>
                <Text fontSize={12} fontFamily="$body" color="#836F8B">more</Text>
              </TouchableOpacity>
            )}

            {isExpanded && shouldTruncate && (
              <TouchableOpacity onPress={() => setExpandedComments((prev) => { const n = new Set(prev); n.delete(comment.id); return n; })}>
                <Text fontSize={12} fontFamily="$body" color="#836F8B">less</Text>
              </TouchableOpacity>
            )}

            <XStack marginTop={12} gap={15}>
              <TouchableOpacity onPress={() => startReply(comment.id, comment.user?.username || "User")}>
                <Text fontSize={12} fontFamily="$body" color="#836F8B">Reply</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => toggleReplies(comment.id)}>
                <Text fontSize={12} fontFamily="$body" color="#836F8B">
                  {areRepliesExpanded ? "Hide" : "View"} Replies ({comment.stats?.repliesCount || 0})
                </Text>
              </TouchableOpacity>
            </XStack>

            {areRepliesExpanded && (
              <View marginTop="$2" marginLeft="$2">
                {comment.replies?.map((reply) => (
                  <ReplyItem
                    key={reply.id}
                    reply={reply}
                    failedAvatarUrls={failedAvatarUrls}
                    setFailedAvatarUrls={setFailedAvatarUrls}
                    toggleLike={toggleLike}
                    startReply={startReply}
                  />
                ))}
              </View>
            )}
          </YStack>
        </XStack>

        <Pressable onPress={() => toggleLike(comment.id, comment.viewerState?.liked || false)} disabled={toggleLikeMutation.isPending}>
          {comment.viewerState?.liked ? (
            <Image source={likeIconActive} width={20} height={20} />
          ) : (
            <Heart size={20} color={colors.primary} />
          )}
          <Text fontSize={10} fontFamily="$body" textAlign="center">{comment.stats?.likesCount || 0}</Text>
        </Pressable>
      </XStack>
    </View>
  );
}

function ReplyItem({
  reply,
  failedAvatarUrls,
  setFailedAvatarUrls,
  toggleLike,
  startReply,
}: {
  reply: any;
  failedAvatarUrls: string[];
  setFailedAvatarUrls: React.Dispatch<React.SetStateAction<string[]>>;
  toggleLike: (id: string, liked: boolean) => void;
  startReply: (id: string, username: string) => void;
}) {
  return (
    <XStack gap="$2" marginTop="$2" alignItems="flex-start">
      <Image
        source={
          reply.user?.avatarUrl && reply.user.avatarUrl.trim() && !failedAvatarUrls.includes(reply.user.avatarUrl)
            ? { uri: reply.user.avatarUrl }
            : { uri: "https://i.pravatar.cc/100?d=mp" }
        }
        width={28}
        height={28}
        borderRadius={14}
        onError={() => reply.user?.avatarUrl && setFailedAvatarUrls((prev) => Array.from(new Set([...prev, reply.user.avatarUrl])))}
      />
      <YStack flex={1}>
        <XStack gap="$2" alignItems="center">
          <Text fontWeight="600" fontFamily="$body" fontSize={13}>{reply.user?.username || "User"}</Text>
          <Text color="#999" fontFamily="$body" fontSize={10}>{formatDate(reply.createdAt)}</Text>
        </XStack>
        <Text fontSize={12} fontFamily="$body" marginTop={2}>{reply.text}</Text>
        <XStack marginTop={8} gap={12}>
          <TouchableOpacity onPress={() => startReply(reply.id, reply.user?.username || "User")}>
            <Text fontSize={11} fontFamily="$body" color="#836F8B">Reply</Text>
          </TouchableOpacity>
        </XStack>
      </YStack>
      <Pressable onPress={() => toggleLike(reply.id, reply.viewerState?.liked || false)}>
        {reply.viewerState?.liked ? (
          <Image source={likeIconActive} width={16} height={16} />
        ) : (
          <Heart size={16} color={colors.primary} />
        )}
        <Text fontSize={9} fontFamily="$body" textAlign="center">{reply.stats?.likesCount || 0}</Text>
      </Pressable>
    </XStack>
  );
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  } catch {
    return "";
  }
}
