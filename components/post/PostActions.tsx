// components/post/PostActions.tsx
import { YStack, Text } from 'tamagui'
import { Heart, MessageCircle, Share } from '@tamagui/lucide-icons'
import { Post } from '@/types/post'

export function PostActions({ post }: { post: Post }) {
  return (
    <YStack
      position="absolute"
      right={12}
      bottom={100}
      gap="$4"
      alignItems="center"
    >
      <YStack alignItems="center">
        <Heart color="white" />
        <Text color="white" fontSize="$2">
          {post.likesCount}
        </Text>
      </YStack>

      <MessageCircle color="white" />
      <Share color="white" />
    </YStack>
  )
}
