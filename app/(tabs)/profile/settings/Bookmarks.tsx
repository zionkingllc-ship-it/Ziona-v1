import Header from "@/components/layout/header";
import PostThumbnail from "@/components/discover/PostThumbnail";
import { useBookmarkFolders } from "@/hooks/useBookmarkSettings";
import { useUserSavedPosts } from "@/hooks/useUserSavedPosts";
import { useRouter, useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, Dimensions, RefreshControl, TouchableOpacity, Image, Pressable, BackHandler } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import colors from "@/constants/colors";
import { FeedPost } from "@/types/feedTypes";
import AuthPrompt from "@/components/ui/AuthPrompt";
import { useAuthStore } from "@/store/useAuthStore";
import { useMemo, useState, useEffect } from "react";
import { normalizePost } from "@/utils/feed/normalizePost";
import { useResponsive } from "@/hooks/useResponsive";

const { width } = Dimensions.get("window");
const ITEM_SIZE = (width - 12) / 3;

export default function BookmarksScreen() {
  const router = useRouter();
  const { wp, hp } = useResponsive();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const {
    data: folders,
    refetch: refetchFolders,
    isLoading: foldersLoading,
    error: foldersError,
  } = useBookmarkFolders();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchFolders();
    setRefreshing(false);
  };

  useEffect(() => {
    if (foldersError) {
      console.log("Folders error:", foldersError);
    }
  }, [foldersError]);

  const selectedFolder = useMemo(() => {
    if (!selectedFolderId || !folders) return null;
    return folders.find((f) => f.id === selectedFolderId);
  }, [selectedFolderId, folders]);

  const {
    data: folderPostsData,
    fetchNextPage: fetchMorePosts,
    hasNextPage,
    isFetchingNextPage,
    isLoading: postsLoading,
    refetch: refetchPosts,
  } = useUserSavedPosts({
    folderId: selectedFolderId || undefined,
  });

  const folderPosts = useMemo(() => {
    if (!folderPostsData) return [];
    const posts = folderPostsData.pages.flatMap((page) => page.posts);
    return posts.map((p: any) => normalizePost(p)).filter((p): p is FeedPost => p !== null);
  }, [folderPostsData]);

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

  const handleBack = () => {
    setSelectedFolderId(null);
  };

  const folderCardWidth = (width - wp(24) - wp(4)) / 2;

  useEffect(() => {
    if (!selectedFolderId) return;
    const onBackPress = () => {
      setSelectedFolderId(null);
      return true;
    };
    BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
  }, [selectedFolderId]);

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

  if (foldersLoading && !folders) {
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <XStack padding={10} justifyContent="space-between" alignItems="center">
        <Header heading={selectedFolder ? selectedFolder.name : "Bookmarks"} />
        {selectedFolderId && (
          <Pressable onPress={handleBack}>
            <Text fontFamily="$body" color={colors.primary} fontSize={14}>
              Back to folders
            </Text>
          </Pressable>
        )}
      </XStack>

      {selectedFolderId ? (
        <>
          <Text fontFamily="$body" fontWeight="600" fontSize={14} paddingHorizontal={wp(6)} marginBottom={hp(1)}>
            {selectedFolder?.name || "Folder"}
          </Text>

          {postsLoading && folderPosts.length === 0 ? (
            <YStack flex={1} justifyContent="center" alignItems="center">
              <Text fontFamily="$body" color={colors.gray}>Loading posts...</Text>
            </YStack>
          ) : folderPosts.length === 0 ? (
            <YStack flex={1} justifyContent="center" alignItems="center">
              <Text fontFamily="$body" color={colors.gray}>
                No posts in this folder
              </Text>
              <Text fontFamily="$body" fontSize={12} color={colors.gray} marginTop={4}>
                Save posts to this folder to see them here
              </Text>
            </YStack>
          ) : (
            <FlatList
              data={folderPosts}
              numColumns={3}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              contentContainerStyle={{ paddingHorizontal: 2, paddingBottom: 20 }}
              columnWrapperStyle={{ gap: 2 }}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) {
                  fetchMorePosts();
                }
              }}
              renderItem={({ item, index }) => (
                <PostThumbnail
                  post={item}
                  size={ITEM_SIZE}
                  onPress={() => handlePostPress(item.id, index)}
                />
              )}
            />
          )}
        </>
      ) : (
        <>
          {folders && folders.length > 0 ? (
            <YStack paddingHorizontal={wp(6)} marginBottom={hp(2)}>
              <Text fontFamily="$body" fontWeight="600" fontSize={14} marginBottom={hp(1)}>
                Folders
              </Text>
              <FlatList
                data={folders}
                numColumns={2}
                keyExtractor={(item) => item.id}
                columnWrapperStyle={{ gap: wp(4) }}
                contentContainerStyle={{ gap: wp(4) }}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{
                      width: folderCardWidth,
                      height: hp(12),
                      backgroundColor: colors.lightGrayBg,
                      borderRadius: wp(3),
                      overflow: "hidden",
                    }}
                    onPress={() => {
                      setSelectedFolderId(item.id);
                      refetchPosts();
                    }}
                  >
                    <YStack flex={1} padding={wp(3)} justifyContent="space-between">
                      <Image
                        source={
                          item.cover
                            ? { uri: item.cover }
                            : require("@/assets/images/FolderBaner.png")
                        }
                        style={{ width: "100%", height: "60%", borderRadius: wp(2) }}
                      />
                      <YStack>
                        <Text fontFamily="$body" fontWeight="600" fontSize={13} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text fontFamily="$body" fontSize={11} color={colors.gray}>
                          {item.savedCount} saved
                        </Text>
                      </YStack>
                    </YStack>
                  </TouchableOpacity>
                )}
              />
            </YStack>
          ) : (
            <YStack flex={1} justifyContent="center" alignItems="center" paddingHorizontal={wp(10)}>
              <Text fontFamily="$body" color={colors.gray} textAlign="center">
                No folders yet
              </Text>
              <Text fontFamily="$body" fontSize={12} color={colors.gray} marginTop={4} textAlign="center">
                Save posts and create folders to organize your bookmarks
              </Text>
            </YStack>
          )}
        </>
      )}
    </SafeAreaView>
  );
}