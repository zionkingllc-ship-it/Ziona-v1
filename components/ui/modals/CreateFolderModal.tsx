import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { Text, View, XStack } from "tamagui";
import KeyboardBottomSheetModal from "./KeyboardBottomSheetModal";
import { FeedPost } from "@/types/feedTypes";
import { generateVideoThumbnail } from "@/helpers/thumbnailGenerator";

interface Props {
  visible: boolean;
  post: FeedPost;
  onClose: () => void;
  onSave: (name: string, cover?: string) => void;
}

export default function CreateFolderModal({
  visible,
  post,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState("");
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [loadingThumbnail, setLoadingThumbnail] = useState(false);

  const sheetAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: 0 }] }));

  useEffect(() => {
    if (!visible || !post) {
      setName("");
      setThumbnailUri(null);
      return;
    }

    const loadThumbnail = async () => {
      if (post.type === "media") {
        const first = post.media?.[0];
        if (first?.thumbnailUrl) {
          setThumbnailUri(first.thumbnailUrl);
          return;
        }
        if (first?.type === "video" && first?.url) {
          setLoadingThumbnail(true);
          try {
            const generated = await generateVideoThumbnail(first.url);
            if (generated) {
              setThumbnailUri(generated);
            } else {
              setThumbnailUri(first.url);
            }
          } catch {
            setThumbnailUri(first.url);
          } finally {
            setLoadingThumbnail(false);
          }
          return;
        }
        if (first?.url) {
          setThumbnailUri(first.url);
          return;
        }
      }

      setThumbnailUri(null);
    };

    loadThumbnail();
  }, [visible, post]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), thumbnailUri || undefined);
    setName("");
  };

  return (
    <KeyboardBottomSheetModal visible={visible} onClose={onClose} maxHeightPercent={0.6}>
      <Animated.View style={[styles.container, sheetAnimatedStyle]}>
        <XStack justifyContent="space-between" alignItems="center">
          <TouchableOpacity onPress={handleSave}>
            <Text color="#7A2E8A" fontWeight="600">Save</Text>
          </TouchableOpacity>

          <Text fontWeight="600">New Folder</Text>

          <TouchableOpacity onPress={onClose}>
            <Text>✕</Text>
          </TouchableOpacity>
        </XStack>

        {loadingThumbnail ? (
          <View style={styles.coverPlaceholder}>
            <ActivityIndicator size="small" color="#999" />
          </View>
        ) : thumbnailUri ? (
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
      </Animated.View>
    </KeyboardBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 24 },
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