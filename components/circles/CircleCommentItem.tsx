import MentionText from "@/components/comments/MentionText";
import React, { useMemo, useState } from "react";
import { TouchableOpacity, Alert, Image } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import { Ionicons } from "@expo/vector-icons";
import { CircleComment } from "@/services/graphQL/mutation/actions/circleComments";
import themeColors from "@/constants/colors";

type Props = {
  comment: CircleComment;
  onLike: (id: string, liked: boolean) => void;
  onDelete: (id: string) => void;
  onReply: (commentId: string, username: string) => void;
  isPending: boolean;
};

type ReplyRowProps = {
  reply: CircleComment;
  mentionMap: Record<string, string>;
  onLike: (id: string, liked: boolean) => void;
  onDelete: (id: string) => void;
  isPending: boolean;
};

function formatDate(dateString?: string): string {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function AvatarCircle({ uri, name, size }: { uri?: string | null; name?: string | null; size: number }) {
  const [failed, setFailed] = useState(false);

  if (uri && !failed) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <XStack
      width={size}
      height={size}
      borderRadius={size / 2}
      backgroundColor="#E0E0E0"
      alignItems="center"
      justifyContent="center"
    >
      <Text fontSize={size * 0.4} fontWeight="600" color="#666">
        {name?.charAt(0)?.toUpperCase() || "?"}
      </Text>
    </XStack>
  );
}

function ReplyRow({ reply, mentionMap, onLike, onDelete, isPending }: ReplyRowProps) {
  return (
    <TouchableOpacity
      onLongPress={() => {
        Alert.alert("Delete comment", "Are you sure?", [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => onDelete(reply.id) },
        ]);
      }}
      activeOpacity={1}
    >
      <XStack gap="$2" paddingLeft="$4" paddingTop="$2" alignItems="flex-start">
        <AvatarCircle uri={reply.author?.avatarUrl} name={reply.author?.name} size={24} />
        <YStack flex={1} gap={1}>
          <XStack gap="$2" alignItems="center">
            <Text fontSize={12} fontWeight="600">
              {reply.author?.name || "User"}
            </Text>
            <Text fontSize={10} color="#999">
              {formatDate(reply.createdAt)}
            </Text>
          </XStack>
          <MentionText text={reply.text} mentionMap={mentionMap} fontSize={12} lineHeight={16} />
          <XStack gap="$2" paddingTop="$1" alignItems="center">
            <TouchableOpacity
              onPress={() => onLike(reply.id, reply.viewerState?.liked ?? false)}
              disabled={isPending}
            >
              <XStack alignItems="center" gap={3}>
                <Ionicons
                  name={reply.viewerState?.liked ? "heart" : "heart-outline"}
                  size={12}
                  color={reply.viewerState?.liked ? themeColors.primary : "#999"}
                />
                <Text fontSize={10} color="#999">
                  {reply.likesCount}
                </Text>
              </XStack>
            </TouchableOpacity>
          </XStack>
        </YStack>
      </XStack>
    </TouchableOpacity>
  );
}

export function CircleCommentItem({ comment, onLike, onDelete, onReply, isPending }: Props) {
  const [showReplies, setShowReplies] = useState(true);
  const hasReplies = (comment.replies?.length || 0) > 0;

  const mentionMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (comment.author?.name && comment.author?.id) map[comment.author.name] = comment.author.id;
    for (const r of comment.replies || []) {
      if (r.author?.name && r.author?.id) map[r.author.name] = r.author.id;
    }
    return map;
  }, [comment]);

  return (
    <TouchableOpacity
      onLongPress={() => {
        Alert.alert("Delete comment", "Are you sure?", [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => onDelete(comment.id) },
        ]);
      }}
      activeOpacity={1}
    >
      <YStack gap="$2" paddingBottom="$2" borderBottomWidth={1} borderBottomColor="#F0F0F0">
        <XStack alignItems="center" gap="$2">
          <AvatarCircle uri={comment.author?.avatarUrl} name={comment.author?.name} size={32} />
          <YStack gap={2} flex={1}>
            <Text fontSize={12} fontWeight="600">
              {comment.author?.name || "User"}
            </Text>
            <Text fontSize={11} color="#999">
              {formatDate(comment.createdAt)}
            </Text>
          </YStack>
        </XStack>

        <MentionText text={comment.text} mentionMap={mentionMap} fontSize={13} lineHeight={18} />

        <XStack gap="$3" paddingLeft="$4" alignItems="center">
          <TouchableOpacity
            onPress={() => onLike(comment.id, comment.viewerState?.liked ?? false)}
            disabled={isPending}
          >
            <XStack alignItems="center" gap="$1">
              <Ionicons
                name={comment.viewerState?.liked ? "heart" : "heart-outline"}
                size={14}
                color={comment.viewerState?.liked ? themeColors.primary : "#999"}
              />
              <Text fontSize={11} color="#999">
                {comment.likesCount}
              </Text>
            </XStack>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onReply(comment.id, comment.author?.name || "User")}>
            <XStack alignItems="center" gap="$1">
              <Ionicons name="chatbubble-ellipses-outline" size={14} color="#999" />
              <Text fontSize={11} color="#999">
                Reply
              </Text>
            </XStack>
          </TouchableOpacity>
        </XStack>

        {hasReplies && showReplies && (
          <YStack gap="$1" paddingTop="$1">
            {comment.replies?.map((reply) => (
              <ReplyRow
                key={reply.id}
                reply={reply}
                mentionMap={mentionMap}
                onLike={onLike}
                onDelete={onDelete}
                isPending={isPending}
              />
            ))}
          </YStack>
        )}

        {(comment.replies?.length || 0) > 0 && (
          <TouchableOpacity onPress={() => setShowReplies((v) => !v)} style={{ paddingLeft: 36 }}>
            <Text fontSize={11} color={themeColors.primary}>
              {showReplies ? "Hide replies" : `View ${comment.replies?.length} ${comment.replies?.length === 1 ? "reply" : "replies"}`}
            </Text>
          </TouchableOpacity>
        )}
      </YStack>
    </TouchableOpacity>
  );
}
