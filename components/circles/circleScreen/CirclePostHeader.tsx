import React from "react";
import { YStack, XStack, Text, Image } from "tamagui";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  post: any;
};

export default function CirclePostHeader({ post }: Props) {
  return (
    <YStack padding="$3" borderBottomWidth={1} borderColor="#EEE" gap="$3">
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="center">
        <XStack alignItems="center" gap="$2">
          <Image
            source={{ uri: post.user.avatar }}
            width={36}
            height={36}
            borderRadius={18}
          />

          <XStack gap="$2" alignItems="center">
            <Text fontWeight="600">{post.user.name}</Text>
            <Text fontSize={12} color="#888">
              {post.createdAt}
            </Text>
          </XStack>
        </XStack>

        <Text
          backgroundColor="#6C2BD9"
          color="#FFF"
          paddingHorizontal="$3"
          paddingVertical="$1"
          borderRadius={20}
          fontSize={12}
        >
          Follow
        </Text>
      </XStack>

      {/* Text */}
      <Text>{post.text}</Text>

      {/* Anchor Preview */}
      {post.anchor && (
        <YStack
          borderRadius={14}
          padding="$3"
          backgroundColor="#0B0F2F"
        >
          <Text color="#FFF" numberOfLines={3}>
            {post.anchor.preview.previewText}
          </Text>
        </YStack>
      )}

      {/* Stats */}
      <XStack gap="$4">
        <XStack alignItems="center" gap="$1">
          <Ionicons name="heart-outline" size={16} />
          <Text>{post.stats.likes}</Text>
        </XStack>

        <XStack alignItems="center" gap="$1">
          <Ionicons name="chatbubble-outline" size={16} />
          <Text>{post.stats.comments}</Text>
        </XStack>
      </XStack>
    </YStack>
  );
}