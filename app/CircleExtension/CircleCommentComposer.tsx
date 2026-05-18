import { useAuthStore } from "@/store/useAuthStore";
import { createCirclePost } from "@/services/graphQL/mutation/circles";
import { saveAnchorRef } from "@/utils/anchorRef";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { AvatarWithInitials } from "@/components/ui/AvatarWithInitials";

type Props = {
  mode?: "action" | "comment";
  anchorPreview?: string;
  prompt?: string;
  onClose?: () => void;
  onSend?: (text: string, image?: string | null) => void;
};

export default function CircleCommentComposer({
  mode: propMode,
  anchorPreview: propAnchorPreview,
  prompt: propPrompt,
  onClose,
  onSend,
}: Props) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [posting, setPosting] = useState(false);
  const [failedAvatarUrls, setFailedAvatarUrls] = useState<string[]>([]);
  const user = useAuthStore((state) => state.user);
  const userName = user?.username || "You";
  const userAvatar = user?.avatarUrl || null;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { circleId, fromScreen, mode: routeMode, anchorPreview: routeAnchorPreview, prompt: routePrompt, anchorRefId } = useLocalSearchParams<{ circleId?: string; fromScreen?: string; mode?: string; anchorPreview?: string; prompt?: string; anchorRefId?: string }>();

  const mode = propMode || (routeMode as "action" | "comment") || "comment";
  const anchorPreview = propAnchorPreview || routeAnchorPreview;
  const prompt = propPrompt || routePrompt;
  const queryClient = useQueryClient();

  const handleSend = async () => {
    if (!text.trim() || posting) return;

    setPosting(true);

    try {
      let result: any = null;
      // If we have a circleId, create a circle post
      if (circleId) {
        console.log("📤 [Composer] Creating post for circle:", circleId, "text:", text.trim());
        result = await createCirclePost(circleId, text.trim(), image || undefined);
        console.log("✅ [Composer] Post created result:", result);
      } else if (onSend) {
        // Otherwise use the callback
        onSend(text, image);
      }

      if (result?.error?.code === "NOT_MEMBER") {
        console.log("❌ [Composer] User is not a member");
        Alert.alert("Join First", "You need to join this circle to post. Tap the Join button on the circle feed.");
        setPosting(false);
        return;
      }

      if (!result?.success) {
        console.log("❌ [Composer] Failed to create post:", result?.error);
        Alert.alert("Error", result?.error?.message || "Failed to create post");
        setPosting(false);
        return;
      }

      // Re-key anchor ref from temp ID to the new post ID
      const newPostId = result?.post?.id;
      if (anchorRefId && newPostId && anchorRefId.startsWith("tempAnchor_")) {
        const { getAnchorRef, removeAnchorRef } = await import("@/utils/anchorRef");
        const refData = await getAnchorRef(anchorRefId);
        if (refData) {
          await saveAnchorRef(newPostId, refData);
          await removeAnchorRef(anchorRefId);
        }
      }

      setShowSuccess(true);
      
      // Reload circle feed to show new post
      if (fromScreen === "circleFeed" && circleId) {
        console.log("🔄 [Composer] Reloading circle feed after post...");
        setTimeout(() => {
          router.replace({
            pathname: "/(tabs)/circle/circleFeed",
            params: { id: circleId, t: Date.now().toString() },
          });
        }, 1500);
        return;
      }
      
      setTimeout(() => {
        setShowSuccess(false);
        if (onClose) {
          onClose();
        } else {
          router.back();
        }
      }, 1500);
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setPosting(false);
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#FFF" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "android" ? -insets.top : 0}
      >
        <View style={{ flex: 1, top: insets.top, paddingBottom: insets.bottom  }}>
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
              <AvatarWithInitials
                uri={userAvatar}
                name={userName}
                size={36}
                failedUris={failedAvatarUrls}
                setFailedUris={setFailedAvatarUrls}
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
              alignItems: "center", 
              gap: 8,
              backgroundColor: "#FFF",
              paddingBottom: insets.bottom || 8,
            }}
          >
            <Pressable
              onPress={async () => {
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ["images"],
                  allowsEditing: true,
                  quality: 0.8,
                });
                if (!result.canceled && result.assets?.[0]?.uri) {
                  setImage(result.assets[0].uri);
                }
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

            <Pressable onPress={handleSend} disabled={posting} style={{ paddingVertical: 8 }}>
              <View
                style={{
                  backgroundColor: text.trim() && !posting ? "#6C2BD9" : "#CCC",
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
              >
                {posting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text color="#FFF">{mode === "action" ? "Share" : "Post"}</Text>
                )}
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
