import { Folder } from "@/types/folder";
import React from "react";
import { FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { Image, Text, View, XStack } from "tamagui";
import KeyboardBottomSheetModal from "./KeyboardBottomSheetModal";

interface Props {
  visible: boolean;
  folders: Folder[];
  savedFolderIds: string[];
  onClose: () => void;
  onToggleFolder: (folderId: string) => void;
  onCreateNew: () => void;
}

export default function BookmarkFoldersModal({
  visible,
  folders,
  savedFolderIds,
  onClose,
  onToggleFolder,
  onCreateNew,
}: Props) {
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

        <FlatList
          data={folders}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isSaved = savedFolderIds.includes(item.id);

            return (
              <TouchableOpacity
                style={styles.row}
                onPress={() => onToggleFolder(item.id)}
              >
                <Image
                  source={
                    item.cover && typeof item.cover === "string"
                      ? { uri: item.cover }
                      : require("@/assets/images/FolderBaner.png")
                  }
                  style={styles.image}
                />

                <Text fontFamily={"$body"} flex={1}>
                  {item.name}
                </Text>

                {isSaved ? (
                  <Image source={bookmarkActive} height={24} width={24} />
                ) : (
                  <Image source={bookmarkInactive} height={24} width={24} />
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </KeyboardBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
});
