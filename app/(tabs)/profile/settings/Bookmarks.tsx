import Header from "@/components/layout/header";
import PostThumbnail from "@/components/discover/PostThumbnail";
import { useUserSavedPosts } from "@/hooks/useUserSavedPosts";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, Dimensions, RefreshControl } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import colors from "@/constants/colors";
import { FeedPost } from "@/types/feedTypes";
import AuthPrompt from "@/components/ui/AuthPrompt";
import { useAuthStore } from "@/store/useAuthStore";
import { useMemo, useState } from "react";
import { normalizePost } from "@/utils/feed/normalizePost";

const { width } = Dimensions.get("window");
const ITEM_SIZE = (width - 12) / 3;

export default function BookmarksScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const {
    data: savedData,
    fetchNextPage: fetchSavedNext,
    hasNextPage: hasSavedNext,
    isFetchingNextPage: fetchingSavedNext,
    isLoading: savedLoading,
    refetch: refetchSaved,
  } = useUserSavedPosts();

  const savedPosts = useMemo(() => {
    if (!savedData?.pages?.length) return [];

    return savedData.pages
      .flatMap((p) => p.posts ?? [])
      .map((p) => normalizePost(p))
      .filter((p): p is FeedPost => p !== null);
  }, [savedData?.pages]);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchSaved();
    setRefreshing(false);
  };

  const handlePostPress = (postId: string, index: number) => {
    router.push({
      pathname: "/viewer/[postId]",
      params: {
        postId,
        source: "saved",
        index: String(index),
      },
    });
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <XStack padding={10}>
          <Header heading="Bookmarks" />
        </XStack>
        <AuthPrompt
          message="Login to access this feature"
          buttonText="Login"
          buttonColor={colors.primary}
        />
      </SafeAreaView>
    );
  }

  if (savedLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <XStack padding={10}>
          <Header heading="Bookmarks" />
        </XStack>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Text fontFamily="$body" color={colors.gray}>Loading...</Text>
        </YStack>
      </SafeAreaView>
    );
  }

  if (savedPosts.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <XStack padding={10}>
          <Header heading="Bookmarks" />
        </XStack>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Text fontFamily="$body" color={colors.gray}>No bookmarks yet</Text>
          <Text fontFamily="$body" fontSize={12} color={colors.gray} marginTop={4}>
            Save posts to see them here
          </Text>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <XStack padding={10}>
        <Header heading="Bookmarks" />
      </XStack>

      <FlatList
        data={savedPosts}
        numColumns={3}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={{ paddingHorizontal: 2, paddingBottom: 20 }}
        columnWrapperStyle={{ gap: 2 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item, index }) => (
          <PostThumbnail
            post={item}
            size={ITEM_SIZE}
            onPress={() => handlePostPress(item.id, index)}
          />
        )}
        onEndReached={() => {
          if (hasSavedNext && !fetchingSavedNext) {
            fetchSavedNext();
          }
        }}
        onEndReachedThreshold={0.5}
      />
    </SafeAreaView>
  );
}
