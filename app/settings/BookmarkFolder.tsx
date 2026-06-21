import Header from "@/components/layout/header";
import { useUserSavedPosts } from "@/hooks/useUserSavedPosts";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pressable, ActivityIndicator, FlatList, RefreshControl } from "react-native";
import { Image, Text, YStack, View } from "tamagui";
import colors from "@/constants/colors";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";

export default function BookmarkFolderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const {
    data: savedPostsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUserSavedPosts({ folderId: id });
  const { refreshing, onRefresh } = usePullToRefresh([["userSavedPosts", id]]);

  const posts = savedPostsData?.pages?.flatMap((p) => p.posts) || [];

  const folderNames: Record<string, string> = {
    all: "All",
    fellowship: "Fellowship",
    message: "Message",
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      
      {/* HEADER */}
      <Header heading={folderNames[id || ""] || "Folder"} />

      {isLoading ? (
        <View flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : posts.length === 0 ? (
        <View flex={1} justifyContent="center" alignItems="center">
          <Text fontFamily="$body" color={colors.gray}>No items in this folder</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ paddingVertical: 6, gap: 4 }}
          columnWrapperStyle={{ gap: 4 }}
          onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator size="small" color={colors.primary} /> : null}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <Pressable
              style={{ flex: 1 }}
              onPress={() => router.push(`/post/${item.id}`)}
            >
              {item.type === "image" ? (
                <Image
                  source={item.media?.items?.[0]?.url ? { uri: item.media.items[0].url } : require("@/assets/images/FolderBaner.png")}
                  width="100%"
                  height={148}
                  borderRadius={10}
                />
              ) : item.type === "bible" ? (
                <YStack
                  backgroundColor={colors.tertiary}
                  height={148}
                  borderRadius={10}
                  padding="$3"
                  justifyContent="center"
                >
                  <Text fontFamily="$body" fontSize={12} color={colors.black} numberOfLines={4}>
                    {item.scripture?.text}
                  </Text>
                </YStack>
              ) : (
                <YStack
                  backgroundColor={colors.tertiary}
                  height={148}
                  borderRadius={10}
                  padding="$3"
                  justifyContent="center"
                >
                  <Text fontFamily="$body" fontSize={12} color={colors.black} numberOfLines={4}>
                    {item.text}
                  </Text>
                </YStack>
              )}
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}