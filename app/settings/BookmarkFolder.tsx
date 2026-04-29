import Header from "@/components/layout/header";
import { useBookmarkFolders, useBulkRemoveBookmarks, BookmarkFolder as BookmarkFolderType } from "@/hooks/useBookmarkSettings";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pressable } from "react-native";
import { Image, Text, XStack, YStack, View } from "tamagui";
import { useState, useMemo } from "react";
import colors from "@/constants/colors";

const tabs = ["All", "Images", "Videos", "Text"];

export default function BookmarkFolderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: folders } = useBookmarkFolders();
  const removeBookmarks = useBulkRemoveBookmarks();
  const [activeTab, setActiveTab] = useState("All");

  const folder = useMemo(() => {
    return (folders || []).find((f: BookmarkFolderType) => f.id === id);
  }, [folders, id]);

  const folderNames: Record<string, string> = {
    all: "All",
    fellowship: "Fellowship",
    message: "Message",
  };

  const posts = folder?.posts || [];

  const filtered = useMemo(() => {
    if (activeTab === "All") return posts;
    if (activeTab === "Images") return posts.filter((p) => p.type === "image");
    if (activeTab === "Videos") return posts.filter((p) => p.type === "video");
    if (activeTab === "Text") return posts.filter((p) => p.type === "text" || p.type === "bible");
    return posts;
  }, [posts, activeTab]);

  const handleRemovePost = async (postId: string, e: any) => {
    e.stopPropagation();
    try {
      await removeBookmarks.mutateAsync([postId]);
    } catch (error) {
      console.log("Failed to remove bookmark:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      
      {/* HEADER */}
      <XStack padding={10}>
        <Header heading={folder?.name || folderNames[id || ""] || "Folder"} />
      </XStack>

      {/* TABS */}
      <XStack paddingHorizontal={16} gap="$2" marginBottom={10}>
        {tabs.map((tab) => {
          const active = tab === activeTab;
          return (
            <Pressable key={tab} onPress={() => setActiveTab(tab)}>
              <YStack
                paddingHorizontal={12}
                paddingVertical={6}
                borderRadius={20}
                backgroundColor={active ? colors.black : colors.lightGrayBg}
              >
                <Text fontFamily="$body" fontSize={12} color={active ? colors.white : colors.black}>
                  {tab}
                </Text>
              </YStack>
            </Pressable>
          );
        })}
      </XStack>

      {/* GRID */}
      {filtered.length === 0 ? (
        <View flex={1} justifyContent="center" alignItems="center">
          <Text fontFamily="$body" color={colors.gray}>No items in this folder</Text>
        </View>
      ) : (
        <YStack flexDirection="row" flexWrap="wrap" padding={6} gap={6}>
          {filtered.map((item: any) => (
            <Pressable 
              key={item.id} 
              style={{ width: "48%" }}
              onPress={() => router.push(`/post/${item.id}`)}
            >
              {item.type === "image" && (
                <Image
                  source={item.media?.items?.[0]?.url ? { uri: item.media.items[0].url } : require("@/assets/images/FolderBaner.png")}
                  width="100%"
                  height={150}
                  borderRadius={10}
                />
              )}

              {item.type === "text" && (
                <YStack
                  backgroundColor={colors.tertiary}
                  height={150}
                  borderRadius={10}
                  padding="$3"
                  justifyContent="center"
                >
                  <Text fontFamily="$body" fontSize={12} color={colors.black} numberOfLines={4}>
                    {item.text}
                  </Text>
                </YStack>
              )}

              {item.type === "bible" && (
                <YStack
                  backgroundColor={colors.tertiary}
                  height={150}
                  borderRadius={10}
                  padding="$3"
                  justifyContent="center"
                >
                  <Text fontFamily="$body" fontSize={12} color={colors.black} numberOfLines={4}>
                    {item.scripture?.text}
                  </Text>
                </YStack>
              )}
            </Pressable>
          ))}
        </YStack>
      )}
    </SafeAreaView>
  );
}