import PostThumbnail from "@/components/discover/PostThumbnail";
import { FeedPost } from "@/types/feedTypes";
import React from "react";
import { FlatList, useWindowDimensions } from "react-native";

type Props = {
  posts: FeedPost[];
  onPress: (post: FeedPost) => void;
};

export default function PostGrid({ posts, onPress }: Props) {
  const { width } = useWindowDimensions();

  const size = width / 3 - 9;

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      numColumns={3}
      renderItem={({ item }) => (
        <PostThumbnail
          post={item}
          size={size}
          onPress={() => onPress(item)}
        />
      )}
      contentContainerStyle={{ paddingHorizontal: 8 }}
      showsVerticalScrollIndicator={false}
    />
  );
}