import colors from "@/constants/colors";
import { useAuthStore } from "@/store/useAuthStore";
import { createCirclePost } from "@/services/graphQL/mutation/circles";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import * as VideoThumbnails from "expo-video-thumbnails";
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

export default function PostComposer() {
  const { circleId } = useLocalSearchParams<{ circleId?: string }>();
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [posting, setPosting] = useState(false);
  const [failedAvatarUrls, setFailedAvatarUrls] = useState<string[]>([]);
  const user = useAuthStore((state) => state.user);
  const userName = user?.username || "You";
  const userAvatar = user?.avatarUrl || null;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleSend = async () => {
    if ((!text.trim() && !image && !video) || posting) return;
    setPosting(true);

    try {
      console.log("[PostComposer] Sending post:", { circleId: circleId || "", text: text.trim() || undefined, image: image || undefined, video: video || undefined });
      const result = await createCirclePost(circleId || "", text.trim() || undefined, image || undefined, video || undefined);
      console.log("[PostComposer] createCirclePost result:", JSON.stringify(result));

      if (result?.error?.code === "NOT_MEMBER") {
        Alert.alert("Join First", "You need to join this circle to post. Tap the Join button on the circle feed.");
        setPosting(false);
        return;
      }

      if (!result?.success) {
        console.error("[PostComposer] Post failed:", JSON.stringify(result?.error));
        Alert.alert("Error", result?.error?.message || "Failed to create post");
        setPosting(false);
        return;
      }

      console.log("[PostComposer] Post created successfully:", JSON.stringify(result?.post));
      setShowSuccess(true);
      if (circleId) {
        queryClient.invalidateQueries({ queryKey: ["circleFeedData", circleId] });
      }

      setTimeout(() => {
        setShowSuccess(false);
        router.back();
      }, 1500);
    } catch (error) {
      console.error("Failed to create post:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
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
        <View style={{ flex: 1, top: insets.top, paddingBottom: insets.bottom }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 12, paddingBottom: 120 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <XStack justifyContent="flex-end">
              <Pressable onPress={() => router.back()}>
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

            {video && (
              <YStack marginTop="$3">
                <View style={{ height: 120, borderRadius: 12, overflow: "hidden", backgroundColor: "#000" }}>
                  <Image source={{ uri: videoThumbnail || video }} height={120} />
                  <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center" }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" }}>
                      <Ionicons name="play" size={20} color="#FFF" />
                    </View>
                  </View>
                </View>
                <Pressable
                  onPress={() => { setVideo(null); setVideoThumbnail(null); }}
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
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== "granted") {
                  Alert.alert("Permission required", "Please grant media library access in Settings to attach media.");
                  return;
                }
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ["images", "videos"],
                  allowsEditing: true,
                  quality: 0.8,
                });
                if (!result.canceled && result.assets?.[0]?.uri) {
                  if (result.assets[0].type === "video") {
                    setVideo(result.assets[0].uri);
                    setImage(null);
                    VideoThumbnails.getThumbnailAsync(result.assets[0].uri)
                      .then(({ uri }) => setVideoThumbnail(uri))
                      .catch(() => setVideoThumbnail(null));
                  } else {
                    setImage(result.assets[0].uri);
                    setVideo(null);
                    setVideoThumbnail(null);
                  }
                }
              }}
              style={{ paddingVertical: 8 }}
            >
              <Ionicons name="image-outline" size={24} color="#333" />
            </Pressable>

            <TextInput
              placeholder="Write something..."
              placeholderTextColor={colors.placeHolderText}
              value={text}
              onChangeText={setText}
              style={{
                flex: 1,
                paddingVertical: 8,
                minHeight: 36,
                maxHeight: 120,
                color: colors.black,
              }}
              multiline
              autoFocus
            />

            <Pressable onPress={handleSend} disabled={posting} style={{ paddingVertical: 8 }}>
              <View
                style={{
                  backgroundColor: (text.trim() || image || video) && !posting ? "#6C2BD9" : "#CCC",
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
              >
                {posting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text color="#FFF">Post</Text>
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
            <Text fontSize={18} fontWeight="600">Post Created!</Text>
          </View>
        </View>
      </Modal>
    </>
  );
}
