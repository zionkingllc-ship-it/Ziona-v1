import Header from "@/components/layout/header";
import PostThumbnail from "@/components/discover/PostThumbnail";
import { useBookmarkFolders, useDeleteBookmarkFolder, useBulkRemoveBookmarks } from "@/hooks/useBookmarkSettings";
import { useUserSavedPosts } from "@/hooks/useUserSavedPosts";
import { useRouter, useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, Dimensions, RefreshControl, TouchableOpacity, Image, Pressable, BackHandler } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";
import colors from "@/constants/colors";
import { FeedPost } from "@/types/feedTypes";
import AuthPrompt from "@/components/ui/AuthPrompt";
import { useAuthStore } from "@/store/useAuthStore";
import { useBookmarksStore } from "@/store/useBookmarkStore";
import { useMemo, useState, useEffect, useCallback } from "react";
import { normalizePost } from "@/utils/feed/normalizePost";
import { useResponsive } from "@/hooks/useResponsive";
import { Ionicons } from "@expo/vector-icons";
import BaseModal from "@/components/ui/modals/BaseModal";
import SuccessModal from "@/components/ui/modals/successModal";

const { width } = Dimensions.get("window");
const ITEM_SIZE = (width - 26) / 3;

export default function BookmarksScreen() {
  const router = useRouter();
  const { wp, hp } = useResponsive();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [confirmDeletePostId, setConfirmDeletePostId] = useState<string | null>(null);
  const [confirmDeleteFolderId, setConfirmDeleteFolderId] = useState<string | null>(null);
  const [deleteFolderName, setDeleteFolderName] = useState<string>("");
  const [deleteSuccessVisible, setDeleteSuccessVisible] = useState(false);
  const postDeleteModalVisible = confirmDeletePostId !== null;
  const folderDeleteModalVisible = confirmDeleteFolderId !== null;

  const deleteFolderMutation = useDeleteBookmarkFolder();
  const bulkRemoveMutation = useBulkRemoveBookmarks();
  const { deleteFolder, removeBookmarks } = useBookmarksStore();

  const {
    data: folders,
    refetch: refetchFolders,
    isLoading: foldersLoading,
    error: foldersError,
    isError,
  } = useBookmarkFolders();

  useEffect(() => {
    console.log("🔍 [BookmarksScreen] folders data:", JSON.stringify(folders, null, 2));
    console.log("🔍 [BookmarksScreen] foldersLoading:", foldersLoading);
    console.log("🔍 [BookmarksScreen] isError:", isError);
    console.log("🔍 [BookmarksScreen] foldersError:", foldersError);
    console.log("🔍 [BookmarksScreen] folders type:", typeof folders, Array.isArray(folders));
    if (Array.isArray(folders)) {
      console.log("🔍 [BookmarksScreen] folders length:", folders.length);
      folders.forEach((f, i) => console.log(`🔍 [BookmarksScreen] folder[${i}]:`, JSON.stringify(f)));
    }
  }, [folders, foldersLoading, isError, foldersError]);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchFolders();
    setRefreshing(false);
  };

  useEffect(() => {
    if (foldersError) {
      console.error("🔍 [BookmarksScreen] Folders error:", foldersError);
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

  const handleBack = () => {
    setSelectedFolderId(null);
    setConfirmDeletePostId(null);
    setConfirmDeleteFolderId(null);
  };

  const handleFolderLongPress = useCallback((folderId: string, folderName: string) => {
    setDeleteFolderName(folderName);
    setConfirmDeleteFolderId(folderId);
  }, []);

  const handleConfirmDeleteFolder = useCallback(() => {
    if (!confirmDeleteFolderId) return;
    deleteFolderMutation.mutate(confirmDeleteFolderId, {
      onSuccess: () => {
        deleteFolder(confirmDeleteFolderId);
        setConfirmDeleteFolderId(null);
        setDeleteSuccessVisible(true);
      },
      onError: (err) => {
        console.error("🔍 [deleteFolder] error:", err);
      },
    });
  }, [confirmDeleteFolderId, deleteFolderMutation, deleteFolder]);

  const handlePostLongPress = useCallback((postId: string) => {
    setConfirmDeletePostId(postId);
  }, []);

  const handlePostPress = useCallback((postId: string, index: number) => {
    router.push({
      pathname: "/viewer/[postId]",
      params: {
        postId,
        source: "saved",
        index: String(index),
      },
    });
  }, [router]);

  const handleConfirmDeletePost = useCallback(() => {
    if (!confirmDeletePostId) return;
    bulkRemoveMutation.mutate([confirmDeletePostId], {
      onSuccess: () => {
        removeBookmarks([confirmDeletePostId], selectedFolderId || undefined);
        setConfirmDeletePostId(null);
      },
    });
  }, [confirmDeletePostId, bulkRemoveMutation, removeBookmarks, selectedFolderId]);

  const folderCardWidth = (width - wp(24) - wp(4)) / 2;

  useEffect(() => {
    if (!selectedFolderId) return;
    const onBackPress = () => {
      setSelectedFolderId(null);
      return true;
    };
    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => subscription.remove();
  }, [selectedFolderId]);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <Header heading="Bookmarks" />
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
        <Header heading="Bookmarks" />
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Text fontFamily="$body" fontWeight="400" color={colors.gray}>Loading...</Text>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <XStack justifyContent="space-between" alignItems="center">
        <Header heading={selectedFolder ? selectedFolder.name : "Bookmarks"} onBackPress={selectedFolderId ? handleBack : undefined} />
        {selectedFolderId && (
          <Pressable onPress={handleBack}>
            <Text fontFamily="$body" fontWeight="500" color={colors.primary} fontSize={14}>
              Back to folders
            </Text>
          </Pressable>
        )}
      </XStack>

      <BaseModal visible={postDeleteModalVisible} onClose={() => setConfirmDeletePostId(null)}>
        <YStack
          backgroundColor={colors.white}
          borderRadius={32}
          padding={wp(8)}
          marginHorizontal={wp(6)}
          alignItems="center"
          gap={wp(4)}
        >
          <Text fontFamily="$body" fontWeight="700" fontSize={18} textAlign="center">
            Remove from bookmarks?
          </Text>
          <Text fontFamily="$body" fontWeight="400" fontSize={14} color={colors.subHeader} textAlign="center" lineHeight={20}>
            This will be removed from your saved items. You can bookmark it again anytime.
          </Text>
          <Pressable onPress={handleConfirmDeletePost}>
            <Text fontFamily="$body" fontWeight="600" fontSize={16} color={colors.DEBIT_RED}>
              Remove
            </Text>
          </Pressable>
          <Pressable onPress={() => setConfirmDeletePostId(null)}>
            <Text fontFamily="$body" fontWeight="500" fontSize={16} color={colors.subHeader}>
              Cancel
            </Text>
          </Pressable>
        </YStack>
      </BaseModal>

      <BaseModal visible={folderDeleteModalVisible} onClose={() => setConfirmDeleteFolderId(null)}>
        <YStack
          backgroundColor={colors.white}
          borderRadius={32}
          padding={wp(8)}
          marginHorizontal={wp(6)}
          alignItems="center"
          gap={wp(4)}
        >
          <Text fontFamily="$body" fontWeight="700" fontSize={18} textAlign="center">
            Delete folder?
          </Text>
          <Text fontFamily="$body" fontWeight="400" fontSize={14} color={colors.subHeader} textAlign="center" lineHeight={20}>
            "{deleteFolderName}" will be permanently deleted along with all saved posts in it.
          </Text>
          <Pressable onPress={handleConfirmDeleteFolder}>
            <Text fontFamily="$body" fontWeight="600" fontSize={16} color={colors.DEBIT_RED}>
              Delete
            </Text>
          </Pressable>
          <Pressable onPress={() => setConfirmDeleteFolderId(null)}>
            <Text fontFamily="$body" fontWeight="500" fontSize={16} color={colors.subHeader}>
              Cancel
            </Text>
          </Pressable>
        </YStack>
      </BaseModal>

      <SuccessModal
        visible={deleteSuccessVisible}
        onClose={() => setDeleteSuccessVisible(false)}
        title="Deleted!"
        message={`"${deleteFolderName}" has been deleted.`}
        type="success"
        autoClose
        duration={3000}
      />

      {selectedFolderId ? (
        <>
          {postsLoading && folderPosts.length === 0 ? (
            <YStack flex={1} justifyContent="center" alignItems="center">
              <Text fontFamily="$body" fontWeight="400" color={colors.gray}>Loading posts...</Text>
            </YStack>
          ) : folderPosts.length === 0 ? (
            <YStack flex={1} justifyContent="center" alignItems="center">
              <Text fontFamily="$body" fontWeight="400" color={colors.gray}>
                No posts in this folder
              </Text>
              <Text fontFamily="$body" fontSize={12} fontWeight="400" color={colors.gray} marginTop={4}>
                Save posts to this folder to see them here
              </Text>
            </YStack>
          ) : (
            <FlatList
              data={folderPosts}
              numColumns={3}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              contentContainerStyle={{ paddingLeft: 4, paddingRight: 18, paddingTop: 8, paddingBottom: 20 }}
              columnWrapperStyle={{ gap: 2 }}
              showsVerticalScrollIndicator={false}
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
                  onLongPress={() => handlePostLongPress(item.id)}
                />
              )}
            />
          )}
        </>
      ) : (
        <>
          {folders && folders.length > 0 ? (
            <YStack alignItems="center" marginBottom={hp(2)}>
              <Text fontFamily="$body" fontWeight="600" fontSize={14} marginBottom={hp(1)}>
                Folders
              </Text>
              <FlatList
                data={folders}
                numColumns={2}
                keyExtractor={(item) => item.id}
                columnWrapperStyle={{ gap: wp(4), justifyContent: "center" }}
                contentContainerStyle={{ gap: wp(4), alignSelf: "center" }}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  console.log("🔍 [FolderCard] id:", item.id, "name:", item.name, "cover:", item.cover);
                  return (
                    <TouchableOpacity
                      style={{
                        width: folderCardWidth,
                        backgroundColor: colors.lightGrayBg,
                        borderRadius: wp(3),
                        overflow: "hidden",
                        padding: 10,
                      }}
                      onPress={() => {
                        setSelectedFolderId(item.id);
                        refetchPosts();
                      }}
                      onLongPress={item.id !== "all" ? () => handleFolderLongPress(item.id, item.name) : undefined}
                    >
                      <Image
                        source={
                          item.cover
                            ? { uri: item.cover }
                            : require("@/assets/images/FolderBaner.png")
                        }
                        style={{ width: "100%", height: 138 }}
                      />
                      <YStack padding={wp(2)} gap={2}>
                        <Text fontFamily="$body" fontWeight="600" fontSize={13} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text fontFamily="$body" fontSize={11} fontWeight="400" color={colors.gray}>
                          {item.savedCount} saved
                        </Text>
                      </YStack>
                    </TouchableOpacity>
                  );
                }}
              />
            </YStack>
          ) : (
            <YStack flex={1} justifyContent="center" alignItems="center" paddingHorizontal={wp(10)}>
              <Text fontFamily="$body" fontWeight="400" color={colors.gray} textAlign="center">
                No folders yet
              </Text>
              <Text fontFamily="$body" fontSize={12} fontWeight="400" color={colors.gray} marginTop={4} textAlign="center">
                Save posts and create folders to organize your bookmarks
              </Text>
            </YStack>
          )}
        </>
      )}
    </SafeAreaView>
  );
}