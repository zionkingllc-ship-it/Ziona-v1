import colors from "@/constants/colors";
import { useAuthStore } from "@/store/useAuthStore";
import { createCirclePost } from "@/services/graphQL/mutation/circles";
import { uploadCircleMedia } from "@/services/graphQL/mutation/media/circleMediaUpload";
import { waitForMediaProcessing } from "@/services/graphQL/mutation/media/mediaUpload";
import { saveAnchorRef } from "@/utils/anchorRef";
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

type Props = {
  mode?: "action" | "comment";
  anchorPreview?: string;
  anchorText?: string;
  bibleReference?: string;
  bibleText?: string;
  prompt?: string;
  onClose?: () => void;
  onSend?: (text: string, image?: string | null, video?: string | null) => void;
};

export default function CircleCommentComposer({
  mode: propMode,
  anchorPreview: propAnchorPreview,
  anchorText: propAnchorText,
  bibleReference: propBibleReference,
  bibleText: propBibleText,
  prompt: propPrompt,
  onClose,
  onSend,
}: Props) {
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
  const { circleId, fromScreen, mode: routeMode, anchorPreview: routeAnchorPreview, prompt: routePrompt, anchorRefId, source, anchorId, anchorText: routeAnchorText, bibleReference: routeBibleRef, bibleText: routeBibleTxt } = useLocalSearchParams<{ circleId?: string; fromScreen?: string; mode?: string; anchorPreview?: string; prompt?: string; anchorRefId?: string; source?: string; anchorId?: string; anchorText?: string; bibleReference?: string; bibleText?: string }>();

  const mode = propMode || (routeMode as "action" | "comment") || "comment";
  const anchorPreview = propAnchorPreview || routeAnchorPreview || buildAnchorPreview();
  const prompt = propPrompt || routePrompt;

  function buildAnchorPreview() {
    const ref = propBibleReference || routeBibleRef;
    const txt = propBibleText || routeBibleTxt;
    const aText = propAnchorText || routeAnchorText;
    if (ref) return `"${ref}"${txt ? `\n${txt}` : ""}`;
    return aText || "";
  }
  const queryClient = useQueryClient();

  const handleSend = async () => {
    if ((!text.trim() && !image && !video) || posting) return;

    setPosting(true);

    try {
      const mediaIds: string[] = [];

      const uploadTasks: Promise<void>[] = [];
      if (image) {
        uploadTasks.push(
          uploadCircleMedia(image, "image/jpeg").then(({ mediaId }) => {
            mediaIds.push(mediaId);
          }),
        );
      }
      if (video) {
        uploadTasks.push(
          (async () => {
            const { uri: thumbUri } = await VideoThumbnails.getThumbnailAsync(video, { time: 0 });
            const [thumb, videoMedia] = await Promise.all([
              uploadCircleMedia(thumbUri, "image/jpeg"),
              uploadCircleMedia(video, "video/mp4"),
            ]);
            mediaIds.push(thumb.mediaId, videoMedia.mediaId);
          })(),
        );
      }
      await Promise.all(uploadTasks);

      let result: any = null;
      // If we have a circleId, create a circle post
      if (circleId) {
        const mediaType = video ? "VIDEO" : image ? "IMAGE" : undefined;

        if (mediaIds.length > 0) {
          await waitForMediaProcessing(mediaIds);
        }

        for (let attempt = 0; attempt < 3; attempt++) {
          result = await createCirclePost(circleId, mediaIds, mediaType);

          if (result?.error?.code === "VALIDATION_ERROR" && result?.error?.message?.includes("still processing")) {
            const delay = Math.min(2000 * Math.pow(2, attempt), 8000);
            await new Promise((r) => setTimeout(r, delay));
            continue;
          }
          break;
        }
      } else if (onSend) {
        onSend(text, image, video);
        return;
      }

      if (result?.error?.code === "NOT_MEMBER") {
        Alert.alert("Join First", "You need to join this circle to post. Tap the Join button on the circle feed.");
        setPosting(false);
        return;
      }

      if (!result?.success) {
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
      if (circleId) {
        queryClient.invalidateQueries({ queryKey: ["circleFeedData", circleId] });
      }
      
      setTimeout(() => {
        setShowSuccess(false);
        if (source === "feed") {
          router.back();
        } else if (onClose) {
          onClose();
        } else {
          router.back();
        }
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

            {video && (
              <YStack marginTop="$3">
                <View style={{ height: 120, borderRadius: 12, overflow: "hidden", backgroundColor: "#000" }}>
                  <Image
                    source={{ uri: videoThumbnail || video }}
                    height={120}
                  />
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
              placeholder={
                mode === "action"
                  ? "Share your reflection..."
                  : "Write a comment..."
              }
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
