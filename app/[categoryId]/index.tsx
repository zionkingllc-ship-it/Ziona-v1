import PostThumbnail from "@/components/discover/PostThumbnail";
import SearchHeader from "@/components/SearchHeader";
import colors from "@/constants/colors";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  useWindowDimensions,
  View,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, XStack } from "tamagui";
import { useDiscoverFeed } from "@/hooks/useDiscover";
import { FeedPost } from "@/types/feedTypes";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";

export default function DiscoverCategoryScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const { width } = useWindowDimensions();

  const { posts } = useDiscoverFeed(categoryId);

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<
    "all" | "images" | "video" | "text"
  >("all");

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <View style={{ flex: 1 }}>
        <SearchHeader
          value={searchQuery}
          onChangeText={setSearchQuery}
          onBackPress={() => router.back()}
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
        />
      </View>
    </SafeAreaView>
  );
}