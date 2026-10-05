import Header from "@/components/layout/header";
import PostThumbnail from "@/components/discover/PostThumbnail";
import { useBookmarkFolders, useDeleteBookmarkFolder, useBulkRemoveBookmarks } from "@/hooks/useBookmarkSettings";
import { useUserSavedPosts } from "@/hooks/useUserSavedPosts";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { ActivityIndicator, FlatList, Dimensions, RefreshControl, TouchableOpacity, Pressable, BackHandler } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";
import colors from "@/constants/colors";
import { FeedPost } from "@/types/feedTypes";
import AuthPrompt from "@/components/ui/AuthPrompt";
import { useAuthStore } from "@/store/useAuthStore";
import { useBookmarksStore } from "@/store/useBookmarkStore";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import PostFilters from "@/components/discover/PostFilters";
import { normalizePost } from "@/utils/feed/normalizePost";
import { useResponsive } from "@/hooks/useResponsive";
import BaseModal from "@/components/ui/modals/BaseModal";
import SuccessModal from "@/components/ui/modals/successModal";
import CenteredMessage from "@/components/ui/CenteredMessage";
import { getNetworkModalCopy } from "@/utils/network/getNetworkModalCopy";
import { resolveCover } from "@/utils/bookmarkCover";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const ITEM_SIZE = (width - 26) / 3;

export default function BookmarksScreen() {
  const router = useRouter();
  const { wp, hp } = useResponsive();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [confirmDeleteFolderIds, setConfirmDeleteFolderIds] = useState<string[] | null>(null);
  const [deleteFolderName, setDeleteFolderName] = useState<string>("");
  const [postDeleteFeedback, setPostDeleteFeedback] = useState<{ visible: boolean; type: "success" | "failed"; title: string; message: string }>({ visible: false, type: "success", title: "", message: "" });
  const [folderDeleteFeedback, setFolderDeleteFeedback] = useState<{ visible: boolean; type: "success" | "failed"; title: string; message: string }>({ visible: false, type: "success", title: "", message: "" });
  const folderDeleteModalVisible = confirmDeleteFolderIds !== null;

  const [selectMode, setSelectMode] = useState(false);
  const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set());
  const [selectedFolderIds, setSelectedFolderIds] = useState<Set<string>>(new Set());
  const [moreModalVisible, setMoreModalVisible] = useState(false);
  const [confirmBulkRemoveVisible, setConfirmBulkRemoveVisible] = useState(false);

  const deleteFolderMutation = useDeleteBookmarkFolder();
  const bulkRemoveMutation = useBulkRemoveBookmarks();
  const { deleteFolder, removeBookmarks, folders: localFolders } = useBookmarksStore();
  const queryClient = useQueryClient();

  const {
    data: folders,
    refetch: refetchFolders,
    isLoading: foldersLoading,
    error: foldersError,
    isError,
  } = useBookmarkFolders();

  useEffect(() => {
  }, [folders, foldersLoading, isError, foldersError]);

  const mergedFolders = useMemo(() =>
    (folders || []).map((f) => ({
      ...f,
      cover: localFolders.find((lf) => lf.id === f.id)?.cover || f.thumbnailUrl || f.cover || "",
    })),
    [folders, localFolders],
  );

  const [coverMap, setCoverMap] = useState<Record<string, any>>({});

  useEffect(() => {
    let mounted = true;
    Promise.all(
      mergedFolders.map(async (f) => {
        const parsed = await resolveCover(f.cover);
        return { folderId: f.id, parsed };
      }),
    ).then((results) => {
      if (!mounted) return;
      const map: Record<string, any> = {};
      results.forEach((r) => {
        map[r.folderId] = r.parsed;
      });
      setCoverMap(map);
    });
    return () => { mounted = false; };
  }, [mergedFolders]);

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
    if (!selectedFolderId || !mergedFolders) return null;
    return mergedFolders.find((f) => f.id === selectedFolderId);
  }, [selectedFolderId, mergedFolders]);

  // The virtual "All" folder can never be deleted.
  const selectedIsAll = useMemo(() => {
    if (!selectedFolder) return false;
    return selectedFolder.id === "all" || selectedFolder.name?.toLowerCase() === "all";
  }, [selectedFolder]);

  const {
    data: folderPostsData,
    fetchNextPage: fetchMorePosts,
    hasNextPage,
    isFetchingNextPage,
    isLoading: postsLoading,
    isError: postsError,
    error: postsErrorObj,
    refetch: refetchPosts,
  } = useUserSavedPosts({
    folderId: selectedFolderId || undefined,
  });

  const folderPosts = useMemo(() => {
    if (!folderPostsData?.pages) return [];
    const posts = folderPostsData.pages.flatMap((page) => page.posts);
    return posts.map((p: any) => normalizePost(p)).filter((p): p is FeedPost => p !== null);
  }, [folderPostsData]);

  const [filter, setFilter] = useState<"all" | "images" | "video" | "text">("all");

  const filteredFolderPosts = useMemo(() => {
    return folderPosts.filter((post: FeedPost) => {
      if (filter === "images") return post.type === "media" && post.media?.[0]?.type === "image";
      if (filter === "video") return post.type === "media" && post.media?.[0]?.type === "video";
      if (filter === "text") return post.type === "text" || post.type === "bible";
      return true;
    });
  }, [folderPosts, filter]);

  const isFolderView = selectedFolderId !== null;
  const selectedIds = isFolderView ? selectedPostIds : selectedFolderIds;
  const hasSelection = selectedIds.size > 0;

  const togglePostSelection = useCallback((postId: string) => {
    setSelectedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  }, []);

  const toggleFolderSelection = useCallback((folderId: string) => {
    setSelectedFolderIds((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);

  const exitSelectMode = useCallback(() => {
    setSelectMode(false);
    setSelectedPostIds(new Set());
    setSelectedFolderIds(new Set());
  }, []);

  const handleBack = () => {
    setSelectedFolderId(null);
    setConfirmDeleteFolderIds(null);
    setConfirmBulkRemoveVisible(false);
    setMoreModalVisible(false);
    exitSelectMode();
    queryClient.invalidateQueries({ queryKey: ["userSavedPosts", undefined] });
  };

  // Long-press never opens a modal — it enters multi-select mode.
  // Deletion always goes through the ellipsis → bottom sheet flow.
  const handleFolderLongPress = useCallback((folderId: string) => {
    setSelectedFolderIds((prev) => {
      if (prev.has(folderId)) return prev;
      const next = new Set(prev);
      next.add(folderId);
      return next;
    });
    setSelectMode(true);
    setMoreModalVisible(false);
  }, []);

  const handleConfirmDeleteFolders = useCallback(() => {
    if (!confirmDeleteFolderIds || confirmDeleteFolderIds.length === 0) return;
    const ids = confirmDeleteFolderIds;
    const deletingOpenFolder = selectedFolderId !== null && ids.includes(selectedFolderId);
    let successCount = 0;
    let failCount = 0;
    ids.forEach((folderId) => {
      deleteFolderMutation.mutate(folderId, {
        onSuccess: () => {
          deleteFolder(folderId);
          successCount++;
          if (successCount + failCount === ids.length) {
            setConfirmDeleteFolderIds(null);
            if (deletingOpenFolder) {
              setSelectedFolderId(null);
            }
            exitSelectMode();
            queryClient.invalidateQueries({ queryKey: ["userSavedPosts", undefined] });
            setTimeout(() => {
              setFolderDeleteFeedback({
                visible: true,
                type: "success",
                title: "Deleted!",
                message: ids.length === 1 ? `"${deleteFolderName}" has been deleted.` : `${successCount} folder(s) deleted.`,
              });
            }, 150);
          }
        },
        onError: () => {
          failCount++;
          if (successCount + failCount === ids.length) {
            setConfirmDeleteFolderIds(null);
            setTimeout(() => {
              setFolderDeleteFeedback({ visible: true, type: "failed", title: "Failed to Delete", message: "Some folders could not be deleted." });
            }, 150);
          }
        },
      });
    });
  }, [confirmDeleteFolderIds, deleteFolderMutation, deleteFolder, deleteFolderName, selectedFolderId, exitSelectMode, queryClient]);

  const handlePostLongPress = useCallback((postId: string) => {
    setSelectedPostIds((prev) => {
      if (prev.has(postId)) return prev;
      const next = new Set(prev);
      next.add(postId);
      return next;
    });
    setSelectMode(true);
  }, []);

  const handlePostPress = useCallback((postId: string, index: number) => {
    if (selectMode) {
      togglePostSelection(postId);
      return;
    }
    router.push({
      pathname: "/viewer/[postId]",
      params: {
        postId,
        source: "saved",
        index: String(index),
      },
    });
  }, [router, selectMode]);

  const handleDeleteAction = useCallback(() => {
    setMoreModalVisible(false);
    if (isFolderView) {
      // Delete the currently open folder (confirmed in the center modal).
      if (!selectedFolderId) return;
      const folder = mergedFolders?.find((f) => f.id === selectedFolderId);
      setDeleteFolderName(folder?.name ?? "");
      setConfirmDeleteFolderIds([selectedFolderId]);
      return;
    }
    // Folder list: delete acts on the current selection. With nothing
    // selected, enter select mode so the user can pick folders first.
    if (selectedFolderIds.size > 0) {
      setConfirmDeleteFolderIds(Array.from(selectedFolderIds));
    } else {
      setSelectMode(true);
    }
  }, [isFolderView, selectedFolderId, selectedFolderIds, mergedFolders]);

  const folderCardWidth = (width - wp(4)) / 2 - 5;

  useEffect(() => {
    if (!selectedFolderId) return;
    const onBackPress = () => {
      if (selectMode) {
        exitSelectMode();
        return true;
      }
      setSelectedFolderId(null);
      queryClient.invalidateQueries({ queryKey: ["userSavedPosts", undefined] });
      return true;
    };
    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => subscription.remove();
  }, [selectedFolderId, selectMode]);

  const handleMorePress = useCallback(() => {
    setMoreModalVisible(true);
  }, []);

  const handleSelectAction = useCallback(() => {
    setMoreModalVisible(false);
    setSelectMode(true);
  }, []);

  const handleBulkRemove = useCallback(() => {
    const postIds = Array.from(selectedPostIds);
    if (postIds.length === 0) return;
    bulkRemoveMutation.mutate(postIds, {
      onSuccess: () => {
        removeBookmarks(postIds, selectedFolderId || undefined);
        exitSelectMode();
        setConfirmBulkRemoveVisible(false);
        queryClient.invalidateQueries({ queryKey: ["userSavedPosts", undefined] });
        setTimeout(() => {
          setPostDeleteFeedback({ visible: true, type: "success", title: "Removed", message: `${postIds.length} post(s) removed from bookmarks.` });
        }, 150);
      },
      onError: () => {
        setConfirmBulkRemoveVisible(false);
        setTimeout(() => {
          setPostDeleteFeedback({ visible: true, type: "failed", title: "Failed to Remove", message: "Please try again." });
        }, 150);
      },
    });
  }, [selectedPostIds, selectedFolderId, bulkRemoveMutation, removeBookmarks, exitSelectMode, queryClient]);

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
        <Header
          heading={selectMode ? `${selectedIds.size} selected` : selectedFolder ? selectedFolder.name : "Bookmarks"}
          onBackPress={selectedFolderId ? handleBack : undefined}
          iconAfter="ellipsis-horizontal"
          onIconAfterPress={handleMorePress}
        />
      </XStack>

      {/* MORE OPTIONS MODAL */}
      <BaseModal visible={moreModalVisible} onClose={() => setMoreModalVisible(false)} alignBottom>
        <YStack
          backgroundColor={colors.white}
          borderTopLeftRadius={20}
          borderTopRightRadius={20}
          paddingTop={24}
          paddingBottom={40}
          alignItems="center"
          gap={0}
        >
          <Pressable
            onPress={handleSelectAction}
            style={{ width: "100%", alignItems: "center", justifyContent: "center", paddingVertical: 16 }}
          >
            <Text fontFamily="$body" fontWeight="600" fontSize={16} color={colors.black}>
              Select
            </Text>
          </Pressable>
          {!(isFolderView && selectedIsAll) && (
            <Pressable
              onPress={handleDeleteAction}
              style={{ width: "100%", alignItems: "center", justifyContent: "center", paddingVertical: 16 }}
            >
              <Text fontFamily="$body" fontWeight="600" fontSize={16} color="#770E0E">
                Delete folder
              </Text>
            </Pressable>
          )}
          <View style={{ width: "100%", height: 1, backgroundColor: "#E8E4E9" }} />
          <Pressable
            onPress={() => setMoreModalVisible(false)}
            style={{ width: "100%", alignItems: "center", justifyContent: "center", paddingVertical: 16 }}
          >
            <Text fontFamily="$body" fontWeight="600" fontSize={16} color={colors.black}>
              Cancel
            </Text>
          </Pressable>
        </YStack>
      </BaseModal>

      {/* BULK REMOVE CONFIRM MODAL */}
      <BaseModal visible={confirmBulkRemoveVisible} onClose={() => setConfirmBulkRemoveVisible(false)}>
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
            This post will be removed from your saved items. You can bookmark it again anytime.
          </Text>
          <Pressable onPress={handleBulkRemove} disabled={bulkRemoveMutation.isPending}>
            {bulkRemoveMutation.isPending ? (
              <ActivityIndicator size="small" color="#770E0E" />
            ) : (
              <Text fontFamily="$body" fontWeight="600" fontSize={16} color="#770E0E">
                Remove
              </Text>
            )}
          </Pressable>
          <Pressable onPress={() => setConfirmBulkRemoveVisible(false)}>
            <Text fontFamily="$body" fontWeight="500" fontSize={16} color={colors.subHeader}>
              Cancel
            </Text>
          </Pressable>
        </YStack>
      </BaseModal>

      <BaseModal visible={folderDeleteModalVisible} onClose={() => setConfirmDeleteFolderIds(null)}>
        <YStack
          backgroundColor={colors.white}
          borderRadius={32}
          padding={wp(8)}
          marginHorizontal={wp(6)}
          alignItems="center"
          gap={wp(4)}
        >
          <Text fontFamily="$body" fontWeight="700" fontSize={18} textAlign="center">
            {confirmDeleteFolderIds && confirmDeleteFolderIds.length > 1
              ? `Delete ${confirmDeleteFolderIds.length} folders?`
              : "Delete folder?"}
          </Text>
          <Text fontFamily="$body" fontWeight="400" fontSize={14} color={colors.subHeader} textAlign="center" lineHeight={20}>
            {confirmDeleteFolderIds && confirmDeleteFolderIds.length > 1
              ? "Selected folders will be permanently deleted along with all saved posts in them."
              : `"${deleteFolderName}" will be permanently deleted along with all saved posts in it.`}
          </Text>
          <Pressable onPress={handleConfirmDeleteFolders} disabled={deleteFolderMutation.isPending}>
            {deleteFolderMutation.isPending ? (
              <ActivityIndicator size="small" color="#770E0E" />
            ) : (
              <Text fontFamily="$body" fontWeight="600" fontSize={16} color="#770E0E">
                Delete
              </Text>
            )}
          </Pressable>
          <Pressable onPress={() => setConfirmDeleteFolderIds(null)}>
            <Text fontFamily="$body" fontWeight="500" fontSize={16} color={colors.subHeader}>
              Cancel
            </Text>
          </Pressable>
        </YStack>
      </BaseModal>

      {postDeleteFeedback.visible && (
        <SuccessModal
          visible={postDeleteFeedback.visible}
          onClose={() => setPostDeleteFeedback((prev) => ({ ...prev, visible: false }))}
          title={postDeleteFeedback.title}
          message={postDeleteFeedback.message}
          type={postDeleteFeedback.type}
          autoClose
          duration={3000}
        />
      )}
      {folderDeleteFeedback.visible && (
        <SuccessModal
          visible={folderDeleteFeedback.visible}
          onClose={() => setFolderDeleteFeedback((prev) => ({ ...prev, visible: false }))}
          title={folderDeleteFeedback.title}
          message={folderDeleteFeedback.message}
          type={folderDeleteFeedback.type}
          autoClose
          duration={3000}
        />
      )}

      {selectedFolderId ? (
        <>
          {postsLoading && folderPosts.length === 0 ? (
            <YStack flex={1} justifyContent="center" alignItems="center">
              <Text fontFamily="$body" fontWeight="400" color={colors.gray}>Loading posts...</Text>
            </YStack>
          ) : postsError && folderPosts.length === 0 ? (
            <CenteredMessage
              text={getNetworkModalCopy(postsErrorObj, "Could not load posts. Please try again.").title}
              subtitle={getNetworkModalCopy(postsErrorObj, "Could not load posts. Please try again.").message}
              actionLabel="Tap to retry"
              onActionPress={() => refetchPosts()}
              fontFamily="$body"
            />
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
            <>
              <PostFilters selected={filter} onSelect={setFilter} />
              <FlatList
                data={filteredFolderPosts}
                numColumns={3}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                contentContainerStyle={{ paddingLeft: 4, paddingRight: 18, paddingTop: 8, paddingBottom: selectMode && hasSelection ? 110 : 20 }}
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
                    selected={selectedPostIds.has(item.id)}
                  />
                )}
              />
            </>
          )}
        </>
      ) : (
        <>
          {isError && !folders ? (
            <CenteredMessage
              text={getNetworkModalCopy(foldersError, "Could not load folders. Please try again.").title}
              subtitle={getNetworkModalCopy(foldersError, "Could not load folders. Please try again.").message}
              actionLabel="Tap to retry"
              onActionPress={() => refetchFolders()}
              fontFamily="$body"
            />
          ) : mergedFolders && mergedFolders.length > 0 ? (
            <YStack marginBottom={hp(2)}>
              <FlatList
                data={mergedFolders}
                numColumns={2}
                keyExtractor={(item) => item.id}
                columnWrapperStyle={{ gap: wp(4), justifyContent: "center" }}
                contentContainerStyle={{ gap: wp(4), alignSelf: "center", paddingHorizontal: 5 }}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => {
                  const isAll = item.id === "all" || item.name?.toLowerCase() === "all" || index === 0;
                  const first4 = isAll ? folderPosts.slice(0, 4) : [];
                  const folderSelected = selectedFolderIds.has(item.id);
                  return (
                    <TouchableOpacity
                      style={{
                        width: folderCardWidth,
                        overflow: "hidden",
                        marginBottom: wp(2),
                        borderWidth: selectMode && folderSelected ? 2 : 0,
                        borderColor: colors.primary,
                        borderRadius: 4,
                      }}
                      onPress={() => {
                        if (selectMode && !isAll) {
                          toggleFolderSelection(item.id);
                        } else {
                          setSelectedFolderId(item.id);
                          refetchPosts();
                        }
                      }}
                      onLongPress={!isAll ? () => handleFolderLongPress(item.id) : undefined}
                    >
                      {isAll && first4.length > 0 ? (
                        <View style={{ width: folderCardWidth, height: folderCardWidth, backgroundColor: colors.lightGrayBg }}>
                          <View style={{ width: "100%", height: "50%", flexDirection: "row" }}>
                            <PostThumbnail post={first4[0]} size={folderCardWidth / 2} onPress={() => {}} pressable={false} />
                            {first4[1] && <PostThumbnail post={first4[1]} size={folderCardWidth / 2} onPress={() => {}} pressable={false} />}
                          </View>
                          <View style={{ width: "100%", height: "50%", flexDirection: "row" }}>
                            {first4[2] && <PostThumbnail post={first4[2]} size={folderCardWidth / 2} onPress={() => {}} pressable={false} />}
                            {first4[3] && <PostThumbnail post={first4[3]} size={folderCardWidth / 2} onPress={() => {}} pressable={false} />}
                          </View>
                        </View>
                      ) : (
                        <View style={{ width: folderCardWidth, height: folderCardWidth }}>
                          {(() => {
                            const parsed = coverMap[item.id] || { type: "image", uri: null };
                            if (parsed.type === "post") {
                              const bgColor = parsed.data?.bgColor || "#181419";
                              const cardText = parsed.data?.textMessage?.trim() || parsed.data?.scriptureText?.trim() || "Text Post";
                              return (
                                <View
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: 3,
                                    backgroundColor: bgColor,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    padding: 10,
                                  }}
                                >
                                  <Text
                                    numberOfLines={3}
                                    style={{
                                      color: colors.black,
                                      fontSize: 12,
                                      fontWeight: "600",
                                      textAlign: "center",
                                      fontFamily: "$body",
                                    }}
                                  >
                                    {cardText}
                                  </Text>
                                </View>
                              );
                            }
                            if (parsed.uri) {
                              return (
                                <Image
                                  source={{ uri: parsed.uri }}
                                  style={{ width: "100%", height: "100%", borderRadius: 3 }}
                                  contentFit="cover"
                                />
                              );
                            }
                            return (
                              <Image
                                source={require("@/assets/images/FolderBaner.png")}
                                style={{ width: "100%", height: "100%", borderRadius: 3 }}
                                contentFit="cover"
                              />
                            );
                          })()}
                          {selectMode && !isAll && folderSelected && (
                            <View
                              style={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                width: 22,
                                height: 22,
                                borderRadius: 11,
                                backgroundColor: colors.primary,
                                justifyContent: "center",
                                alignItems: "center",
                                borderWidth: 2,
                                borderColor: "white",
                              }}
                            >
                              <Ionicons name="checkmark" size={14} color="white" />
                            </View>
                          )}
                        </View>
                      )}
                      <YStack padding={wp(2)} gap={2}>
                        <Text fontFamily="$body" fontWeight="600" fontSize={13} numberOfLines={1}>
                          {item.name}
                        </Text>
                      </YStack>
                    </TouchableOpacity>
                  );
                }}
              />
            </YStack>
           ) : (
             <YStack flex={1} justifyContent="center" alignItems="center" paddingHorizontal={wp(10)}>
               <Text fontFamily="$body" fontSize={13} fontWeight="400" color={colors.gray} textAlign="center">
                 You have not created any folders
               </Text>
               <Pressable
                 style={{
                   width: 82,
                   height: 19,
                   marginTop: 8,
                   backgroundColor: colors.primary,
                   alignItems: "center",
                   justifyContent: "center",
                   borderRadius: 4,
                 }}
               >
                 <Text fontFamily="$body" fontSize={13} color={colors.white} textAlign="center">
                   create folder
                 </Text>
               </Pressable>
             </YStack>
           )}
        </>
      )}

      {/* REMOVE BUTTON BAR — SELECT MODE, PINNED TO BOTTOM */}
      {selectMode && hasSelection && (
        <View style={{ height: 84 }} />
      )}
      {selectMode && hasSelection && (
        <XStack
          justifyContent="center"
          alignItems="center"
          paddingVertical={12}
          paddingBottom={20}
          backgroundColor={colors.white}
          borderTopWidth={1}
          borderTopColor="#E8E4E9"
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          zIndex={10}
        >
          <Pressable
            onPress={() => {
              if (isFolderView) {
                setConfirmBulkRemoveVisible(true);
              } else if (selectedFolderIds.size > 0) {
                setConfirmDeleteFolderIds(Array.from(selectedFolderIds));
              }
            }}
            style={{
              width: 219,
              height: 48,
              backgroundColor: "#EEEBEF",
              borderWidth: 1,
              borderColor: "#531769",
              borderRadius: 6,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text fontFamily="$body" fontWeight="600" fontSize={16} color={colors.black}>
              remove
            </Text>
          </Pressable>
        </XStack>
      )}
    </SafeAreaView>
  );
}
