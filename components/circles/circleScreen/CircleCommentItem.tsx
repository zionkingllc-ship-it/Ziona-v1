import React from "react";
import { YStack, XStack, Text, Image } from "tamagui";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  user: {
    name: string;
    avatar: string;
  };
  date: string;
  text: string;
  likes: number;
};

export default function CircleCommentItem({
  user,
  date,
  text,
  likes,
}: Props) {
  return (
    <YStack paddingVertical="$3" borderBottomWidth={1} borderColor="#EEE">
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="center">
        <XStack alignItems="center" gap="$2">
          <Image
            source={{ uri: user.avatar }}
            width={32}
            height={32}
            borderRadius={16}
          />

          <XStack gap="$2" alignItems="center">
            <Text fontWeight="600">{user.name}</Text>
            <Text fontSize={12} color="#888">
              {date}
            </Text>
          </XStack>
        </XStack>

        <Ionicons name="ellipsis-horizontal" size={16} color="#777" />
      </XStack>

      {/* Text */}
      <Text marginTop="$2" color="#333">
        {text}
      </Text>

      {/* Actions */}
      <XStack gap="$4" marginTop="$2">
        <XStack alignItems="center" gap="$1">
          <Ionicons name="heart-outline" size={16} />
          <Text fontSize={13}>{likes}</Text>
        </XStack>

        <Ionicons name="chatbubble-outline" size={16} />
      </XStack>
    </YStack>
  );
}