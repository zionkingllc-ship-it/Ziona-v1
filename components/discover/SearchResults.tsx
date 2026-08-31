import colors from "@/constants/colors";
import { FeedPost } from "@/types/feedTypes";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  useWindowDimensions,
  View,
} from "react-native";
import { Text, XStack, YStack } from "tamagui";
import PostThumbnail from "./PostThumbnail";

type Creator = {
  id: string;
  username: string;
  avatarUrl?: string | null;
  bio?: string | null;
  isFollowing: boolean;
  stats?: {
    followersCount: string;
    followingCount: string;
    postsCount: string;
  } | null;
};

type Props = {
  creators: Creator[];
  posts: FeedPost[];
  creatorCount: number;
  postCount: number;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage?: boolean;
  onFetchNextPage?: () => void;
};

export default function DiscoverSearchResults({
  creators,
  posts,
  creatorCount,
  postCount,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onFetchNextPage,
}: Props) {
  const { width } = useWindowDimensions();

  const handleUserPress = (userId: string) => {
    router.push(`/guest?userId=${userId}`);
  };

  const handlePostPress = (post: FeedPost) => {
    router.push({
      pathname: "/viewer/[postId]",
      params: { postId: post.id },
    });
  };

  const renderCreator = ({ item }: { item: Creator }) => {
    const initials = item.username?.[0]?.toUpperCase() ?? "?";
    return (
      <Pressable onPress={() => handleUserPress(item.id)}>
        <XStack
          alignItems="center"
          gap="$3"
          paddingHorizontal={16}
          paddingVertical={10}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.gray,
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            {item.avatarUrl ? (
              <Image
                source={{ uri: item.avatarUrl }}
                style={{ width: 40, height: 40 }}
                contentFit="cover"
              />
            ) : (
              <Text color={colors.white} fontSize={14} fontWeight="600">
                {initials}
              </Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text
              fontFamily="$body"
              fontWeight="600"
              fontSize={15}
              color={colors.text}
            >
              {item.username}
            </Text>
            {item.bio ? (
              <Text
                fontFamily="$body"
                fontWeight="400"
                fontSize={12}
                color={colors.gray}
                numberOfLines={1}
              >
                {item.bio}
              </Text>
            ) : null}
          </View>
        </XStack>
      </Pressable>
    );
  };

  const renderHeader = () => {
    if (creators.length === 0) return null;

    return (
      <View>
        <XStack
          paddingHorizontal={16}
          paddingVertical={8}
          alignItems="center"
        >
          <Text
            fontFamily="$body"
            fontWeight="600"
            fontSize={14}
            color={colors.subHeader}
          >
            People
          </Text>
          <Text
            fontFamily="$body"
            fontWeight="400"
            fontSize={12}
            color={colors.gray}
            marginLeft={8}
          >
            {creatorCount}
          </Text>
        </XStack>
        <FlatList
          data={creators}
          keyExtractor={(item) => item.id}
          renderItem={renderCreator}
          scrollEnabled={false}
        />
        {posts.length > 0 && (
          <XStack
            paddingHorizontal={16}
            paddingVertical={8}
            marginTop={8}
            alignItems="center"
          >
            <Text
              fontFamily="$body"
              fontWeight="600"
              fontSize={14}
              color={colors.subHeader}
            >
              Posts
            </Text>
            <Text
              fontFamily="$body"
              fontWeight="400"
              fontSize={12}
              color={colors.gray}
              marginLeft={8}
            >
              {postCount}
            </Text>
          </XStack>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <YStack paddingVertical={16} alignItems="center">
        <ActivityIndicator size="small" color={colors.primary} />
      </YStack>
    );
  };

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" paddingTop={40}>
        <ActivityIndicator size="large" color={colors.primary} />
      </YStack>
    );
  }

  if (creators.length === 0 && posts.length === 0) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        paddingHorizontal={16}
        paddingTop={40}
      >
        <Ionicons name="search" size={40} color={colors.inactiveButton} />
        <Text
          fontFamily="$body"
          fontWeight="400"
          fontSize={14}
          color={colors.gray}
          marginTop={12}
        >
          No results found
        </Text>
      </YStack>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      numColumns={3}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      renderItem={({ item }) => (
        <PostThumbnail
          post={item}
          size={width / 3 - 9}
          onPress={() => handlePostPress(item)}
        />
      )}
      contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage && onFetchNextPage) {
          onFetchNextPage();
        }
      }}
      onEndReachedThreshold={0.5}
    />
  );
}
