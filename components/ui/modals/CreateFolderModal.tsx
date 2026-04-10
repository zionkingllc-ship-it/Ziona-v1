import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Text, View, XStack } from "tamagui";
import KeyboardBottomSheetModal from "./KeyboardBottomSheetModal";
import { FeedPost } from "@/types/feedTypes";

interface Props {
  visible: boolean;
  post: FeedPost;
  onClose: () => void;
  onSave: (name: string) => void;
}

export default function CreateFolderModal({
  visible,
  post,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState("");
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !post) {
      setName("");
      return;
    }

    if (post.type === "media") {
      const first = post.media?.[0];
      if (first?.thumbnailUrl) {
        setThumbnailUri(first.thumbnailUrl);
        return;
      }
      if (first?.url) {
        setThumbnailUri(first.url);
        return;
      }
    }

    /* TEXT / BIBLE → no thumbnail */
    setThumbnailUri(null);
  }, [visible, post]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim());
    setName("");
  };

  return (
    <KeyboardBottomSheetModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <XStack justifyContent="space-between" alignItems="center">
          <TouchableOpacity onPress={handleSave}>
            <Text color="#7A2E8A" fontWeight="600">Save</Text>
          </TouchableOpacity>

          <Text fontWeight="600">New Folder</Text>

          <TouchableOpacity onPress={onClose}>
            <Text>✕</Text>
          </TouchableOpacity>
        </XStack>

        {/* COVER */}
        {thumbnailUri ? (
          <Image source={{ uri: thumbnailUri }} style={styles.cover} />
        ) : (
          <View style={styles.coverPlaceholder} />
        )}

        <TextInput
          placeholder="Create Folder Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholderTextColor="#aaa"
        />
      </View>
    </KeyboardBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 20 },
  cover: {
    width: 100,
    height: 100,
    borderRadius: 20,
    alignSelf: "center",
  },
  coverPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 20,
    alignSelf: "center",
    backgroundColor: "#e5e5e5",
  },
  input: {
    borderRadius: 12,
    backgroundColor: "#F3F3F3",
    padding: 14,
  },
});