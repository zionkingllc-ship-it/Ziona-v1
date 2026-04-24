import React from "react";
import { YStack, XStack, Text, Image } from "tamagui";
import { Ionicons } from "@expo/vector-icons";

type AnchorPost = {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  createdAt: string;

  text?: string;
  image?: string;

  anchor?: {
    type: "text" | "image" | "video";
    preview: string;
  };

  likes: number;
  comments: number;
};

type Props = {
  post: AnchorPost;
};

export default function CircleFeedItem({ post }: Props) {
  return (
    <YStack padding="$3" gap="$3" backgroundColor="#FFF">
      {/* HEADER */}
      <XStack justifyContent="space-between" alignItems="center">
        <XStack alignItems="center" gap="$2">
          <Image
            source={{ uri: post.user.avatar }}
            width={36}
            height={36}
            borderRadius={18}
          />
          <YStack>
            <Text fontWeight="600">{post.user.name}</Text>
            <Text fontSize={12} color="#888">
              {post.createdAt}
            </Text>
          </YStack>
        </XStack>

        <Ionicons name="ellipsis-horizontal" size={18} color="#777" />
      </XStack>

      {/* TEXT */}
      {post.text && (
        <Text fontSize={15} color="#333" lineHeight={20}>
          {post.text}
        </Text>
      )}

      {/* ANCHOR PREVIEW */}
      {post.anchor && (
        <YStack
          borderRadius={14}
          padding="$3"
          backgroundColor="#0B0F2F"
        >
          <Text color="#FFF" numberOfLines={3}>
            {post.anchor.preview}
          </Text>
        </YStack>
      )}

      {/* IMAGE */}
      {post.image && (
        <Image
          source={{ uri: post.image }}
          width="100%"
          height={200}
          borderRadius={14}
          resizeMode="cover"
        />
      )}

      {/* ACTIONS */}
      <XStack gap="$4" marginTop="$1">
        <XStack alignItems="center" gap="$1">
          <Ionicons name="heart-outline" size={18} />
          <Text>{post.likes}</Text>
        </XStack>

        <XStack alignItems="center" gap="$1">
          <Ionicons name="chatbubble-outline" size={18} />
          <Text>{post.comments}</Text>
        </XStack>
      </XStack>
    </YStack>
  );
}