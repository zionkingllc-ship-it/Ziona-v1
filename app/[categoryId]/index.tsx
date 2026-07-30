import PostThumbnail from "@/components/discover/PostThumbnail";
import SearchHeader from "@/components/SearchHeader";
import colors from "@/constants/colors";
import { useDiscoverFeed } from "@/hooks/useDiscover";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { FeedPost } from "@/types/feedTypes";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, XStack, YStack } from "tamagui";
import CenteredMessage from "@/components/ui/CenteredMessage";
import { getNetworkModalCopy } from "@/utils/network/getNetworkModalCopy";

export default function DiscoverCategoryScreen() {
  const { categoryId, label } = useLocalSearchParams<{ categoryId: string; label?: string }>();
  const { width } = useWindowDimensions();

  const { posts, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error, refetch } =
    useDiscoverFeed(categoryId);

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "images" | "video" | "text">(
    "all",
  );

  const { refreshing, onRefresh } = usePullToRefresh([
    ["discoverFeed", categoryId],
  ]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post: FeedPost) => {
      if (filter === "images") {
        return post.type === "media" && post.media?.[0]?.type === "image";
      }

      if (filter === "video") {
        return post.type === "media" && post.media?.[0]?.type === "video";
      }

      if (filter === "text") {
        return post.type === "text" || post.type === "bible";
      }

      return true;
    });
  }, [posts, filter]);

  if (isLoading && posts.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <View style={{ flex: 1 }}>
          <SearchHeader value={searchQuery} onChangeText={setSearchQuery} onBackPress={() => router.back()} placeholder={label || "Search"} />
          <YStack flex={1} justifyContent="center" alignItems="center">
            <ActivityIndicator size="large" color={colors.primary} />
          </YStack>
        </View>
      </SafeAreaView>
    );
  }

  if (isError && posts.length === 0) {
    const feedback = getNetworkModalCopy(error, "We couldn't load posts right now. Please try again.");
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <View style={{ flex: 1 }}>
          <SearchHeader value={searchQuery} onChangeText={setSearchQuery} onBackPress={() => router.back()} placeholder={label || "Search"} />
          <CenteredMessage
            text={feedback.title}
            subtitle={feedback.message}
            actionLabel="Tap to retry"
            onActionPress={() => refetch()}
            fontFamily="$body"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <View style={{ flex: 1 }}>
        <SearchHeader
          value={searchQuery}
          onChangeText={setSearchQuery}
          onBackPress={() => router.back()}
          placeholder={label || "Search"}
        />

        <XStack style={{ paddingHorizontal: 16, marginBottom: 12 }} gap="$2">
          {(["all", "images", "video", "text"] as const).map((f) => (
            <Text
              key={f}
              paddingHorizontal={16}
              paddingVertical={6}
              borderRadius={6}
              borderWidth={1}
              backgroundColor={filter === f ? "#181419" : "#f0f0f0"}
              borderColor={filter === f ? "#181419" : "#EEEBEF"}
              color={filter === f ? colors.white : "#4E4252"}
              onPress={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          ))}
        </XStack>

        {filteredPosts.length === 0 ? (
          <YStack flex={1} justifyContent="center" alignItems="center" paddingHorizontal={16}>
            <Text fontFamily="$body" fontWeight="400" fontSize={14} color={colors.gray}>
              No posts yet
            </Text>
            <Text fontFamily="$body" fontWeight="400" fontSize={12} color={colors.gray} marginTop={4}>
              Posts in this category will appear here
            </Text>
          </YStack>
        ) : (
        <FlatList
          data={filteredPosts}
          keyExtractor={(item) => item.id}
          numColumns={3}
          renderItem={({ item, index }) => (
            <PostThumbnail
              post={item}
              size={width / 3 - 9}
              onPress={() => {
                router.push({
                  pathname: `/viewer/${item.id}`,
                  params: {
                    categoryId,
                    filter,
                    index: String(index),
                  },
                });
              }}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 8 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
        />
        )}
      </View>
    </SafeAreaView>
  );
}
