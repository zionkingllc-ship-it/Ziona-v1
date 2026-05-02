import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image, Text, XStack, YStack } from "tamagui";

type Props = {
  mode?: "action" | "comment";
  anchorPreview?: string;
  prompt?: string;
  onClose?: () => void;
  onSend?: (text: string, image?: string | null) => void;
};

export default function CircleCommentComposer({
  mode = "comment",
  anchorPreview,
  prompt,
  onClose,
  onSend,
}: Props) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const user = useAuthStore((state) => state.user);
  const userName = user?.username || "You";
  const userAvatar = user?.avatarUrl || "https://i.pravatar.cc/100?img=1";
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { circleId } = useLocalSearchParams<{ circleId?: string }>();

  const handleSend = () => {
    if (!text.trim()) return;

    if (onSend) {
      onSend(text, image);
    }

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      if (onClose) {
        onClose();
      } else {
        router.back();
      }
    }, 1500);
  };

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#FFF" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "android" ? -insets.top : 0}
      >
        <View style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 12, paddingBottom: 120 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <XStack justifyContent="flex-end">
              <Pressable
                onPress={() => {
                  if (onClose) onClose();
                  else router.back();
                }}
              >
                <Text color="#666">Cancel</Text>
              </Pressable>
            </XStack>

            <XStack alignItems="center" gap="$2" marginTop="$2">
              <Image
                source={{ uri: userAvatar }}
                width={36}
                height={36}
                borderRadius={18}
              />
              <Text fontWeight="600">{userName}</Text>
            </XStack>

            {mode === "action" && prompt && (
              <Text marginTop="$2" color="#7A6E8A">
                {prompt}
              </Text>
            )}

            {anchorPreview && (
              <YStack
                marginTop="$3"
                borderRadius={12}
                padding="$3"
                backgroundColor="#0B0F2F"
              >
                <Text color="#FFF" numberOfLines={2}>
                  {anchorPreview}
                </Text>
              </YStack>
            )}

            {image && (
              <YStack marginTop="$3">
                <Image source={{ uri: image }} height={120} borderRadius={12} />
                <Pressable
                  onPress={() => setImage(null)}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    borderRadius: 20,
                    padding: 6,
                  }}
                >
                  <Ionicons name="trash-outline" size={16} color="#FFF" />
                </Pressable>
              </YStack>
            )}
          </ScrollView>

          <View
            style={{
              borderTopWidth: 1,
              borderColor: "#EEE",
              padding: 8,
              flexDirection: "row",
              alignItems: "flex-end",
              gap: 8,
              backgroundColor: "#FFF",
              paddingBottom: insets.bottom || 8,
            }}
          >
            <Pressable
              onPress={() => {
                setImage("https://picsum.photos/300");
              }}
              style={{ paddingVertical: 8 }}
            >
              <Ionicons name="image-outline" size={22} color="#333" />
            </Pressable>

            <TextInput
              placeholder={
                mode === "action"
                  ? "Share your reflection..."
                  : "Write a comment..."
              }
              value={text}
              onChangeText={setText}
              style={{
                flex: 1,
                paddingVertical: 8,
                minHeight: 36,
                maxHeight: 120,
              }}
              multiline
              autoFocus
            />

            <Pressable onPress={handleSend} style={{ paddingVertical: 8 }}>
              <View
                style={{
                  backgroundColor: text.trim() ? "#6C2BD9" : "#CCC",
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
              >
                <Text color="#FFF">{mode === "action" ? "Share" : "Post"}</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={showSuccess} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#FFF",
              padding: 24,
              borderRadius: 16,
              alignItems: "center",
              gap: 12,
            }}
          >
            <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
            <Text fontSize={18} fontWeight="600">
              {mode === "action" ? "Reflection Shared!" : "Comment Posted!"}
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
}
