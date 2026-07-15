import { useBookmarkFolders } from "@/hooks/useBookmarkSettings";
import { useBookmarksStore } from "@/store/useBookmarkStore";
import { parseCover } from "@/utils/bookmarkCover";
import React, { useMemo } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { Image, Text, XStack } from "tamagui";
import KeyboardBottomSheetModal from "./KeyboardBottomSheetModal";

interface Props {
  visible: boolean;
  savedFolderIds: string[];
  onClose: () => void;
  onToggleFolder: (folderId: string) => void;
  onCreateNew: () => void;
}

export default function BookmarkFoldersModal({
  visible,
  savedFolderIds,
  onClose,
  onToggleFolder,
  onCreateNew,
}: Props) {
  const { data: apiFolders = [], isLoading } = useBookmarkFolders();
  const { folders: localFolders } = useBookmarksStore();

  const folders = useMemo(() =>
    apiFolders.map((f) => ({
      ...f,
      cover: localFolders.find((lf) => lf.id === f.id)?.cover || f.thumbnailUrl || f.cover || "",
    })),
    [apiFolders, localFolders],
  );
  
  const bookmarkInactive = require("@/assets/images/bookmarkBlackIcon.png");
  const bookmarkActive = require("@/assets/images/bookmarkIconActive.png");

  return (
    <KeyboardBottomSheetModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontFamily={"$body"} fontWeight="600">
            Folders
          </Text>
          <TouchableOpacity onPress={onCreateNew}>
            <Text fontFamily={"$body"} color="#7A2E8A">
              + Create new folder
            </Text>
          </TouchableOpacity>
        </XStack>

        {isLoading ? (
          <View style={styles.loading}>
            <Text fontFamily={"$body"} color="#999">Loading...</Text>
          </View>
        ) : folders.length === 0 ? (
          <View style={styles.loading}>
            <Text fontFamily={"$body"} color="#999">No folders yet</Text>
          </View>
        ) : (
          <FlatList
            data={folders}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                  const isSaved = savedFolderIds.includes(item.id);
                  const parsed = parseCover(item.cover);

                  return (
                    <TouchableOpacity
                      style={styles.row}
                      onPress={() => onToggleFolder(item.id)}
                    >
                      {parsed.type === "post" ? (
                        <View style={[styles.image, { backgroundColor: parsed.data.bgColor || "#181419", justifyContent: "center", alignItems: "center" }]}>
                          <Text fontFamily="$body" fontSize={10} fontWeight="600" color="#333" textAlign="center" numberOfLines={2}>
                            {parsed.data.textMessage?.trim() || parsed.data.scriptureText?.trim() || "Text Post"}
                          </Text>
                        </View>
                      ) : (
                        <Image
                          source={
                            parsed.uri
                              ? { uri: parsed.uri }
                              : require("@/assets/images/FolderBaner.png")
                          }
                          style={styles.image}
                        />
                      )}

                      <View style={styles.info}>
                        <Text fontFamily={"$body"}>
                          {item.name}
                        </Text>
                        <Text fontFamily={"$body"} fontSize={12} color="#999">
                          {item.savedCount} saved
                        </Text>
                      </View>

                      {isSaved ? (
                        <Image source={bookmarkActive} height={24} width={24} />
                      ) : (
                        <Image source={bookmarkInactive} height={24} width={24} />
                      )}
                    </TouchableOpacity>
                  );
                }}
          />
        )}
      </View>
    </KeyboardBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  info: {
    flex: 1,
    gap: 2,
  },
});
