import colors from "@/constants/colors";
import { MAX_VIDEO_DURATION_MS, MAX_VIDEO_DURATION_LABEL } from "@/constants/videoLimits";
import { useAuthStore } from "@/store/useAuthStore";
import { createCirclePost } from "@/services/graphQL/mutation/circles";
import { uploadCircleMedia } from "@/services/graphQL/mutation/media/circleMediaUpload";
import { getMimeType } from "@/services/utils/mime";
import { waitForMediaProcessing } from "@/services/graphQL/mutation/media/mediaUpload";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useState, useEffect, useRef } from "react";
import { convertToSupportedFormat } from "@/services/utils/imageConversion";
import {
  ActivityIndicator,
  Keyboard,
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
import { keyboardBehavior } from "@/constants/platform";
import { AvatarWithInitials } from "@/components/ui/AvatarWithInitials";
import SuccessModal from "@/components/ui/modals/successModal";
import { AppError, getErrorMessage } from "@/utils/error";

type Props = {
  /** Optional circleId passed from a wrapper route to ensure the param is available */
  initialCircleId?: string;
};

export default function PostComposer({ initialCircleId }: Props) {
  const localParams = useLocalSearchParams<{ circleId?: string }>();
  const circleId = initialCircleId ?? localParams.circleId;
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorType, setErrorType] = useState<"warning" | "failed">("failed");
  const [picking, setPicking] = useState(false);
  const [posting, setPosting] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [failedAvatarUrls, setFailedAvatarUrls] = useState<string[]>([]);
  const cancelledRef = useRef(false);
  const player = useVideoPlayer(video || "", (p) => {
    p.loop = false;
  });

  useEffect(() => {
    if (!player) return;
    if (videoPlaying) {
      player.play();
    } else {
      player.pause();
    }
  }, [player, videoPlaying]);

  useEffect(() => {
    if (!player) return;
    const sub = player.addListener("playToEnd", () => {
      setVideoPlaying(false);
    });
    return () => sub.remove();
  }, [player]);
  const user = useAuthStore((state) => state.user);
  const userName = user?.username || "You";
  const userAvatar = user?.avatarUrl || null;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const handleCancelPosting = () => {
    cancelledRef.current = true;
    setPosting(false);
  };

  const handleSend = async () => {
    if ((!text.trim() && !image && !video) || posting) return;

    if (video && (videoDuration ?? 0) > MAX_VIDEO_DURATION_MS) {
      const secs = Math.round((videoDuration ?? 0) / 1000);
      setErrorType("warning");
      setErrorMessage(`Videos must be under ${MAX_VIDEO_DURATION_LABEL}. This video is ${secs} seconds long.`);
      setShowError(true);
      return;
    }

    cancelledRef.current = false;
    setPosting(true);

    try {
      const mediaIds: string[] = [];

      const uploadTasks: Promise<void>[] = [];
      if (image) {
        uploadTasks.push(
          uploadCircleMedia(image, getMimeType(image, "IMAGE")).then(({ mediaId }) => {
            if (cancelledRef.current) return;
            mediaIds.push(mediaId);
          }),
        );
      }
      if (video) {
        uploadTasks.push(
          (async () => {
            const videoMedia = await uploadCircleMedia(video, getMimeType(video, "VIDEO"));
            if (cancelledRef.current) return;
            mediaIds.push(videoMedia.mediaId);
          })(),
        );
      }
      await Promise.all(uploadTasks);
      if (cancelledRef.current) return;

      const mediaType = video ? "VIDEO" : image ? "IMAGE" : undefined;

      if (mediaIds.length > 0) {
        await waitForMediaProcessing(mediaIds);
      }
      if (cancelledRef.current) return;

      let result: any;
      for (let attempt = 0; attempt < 3; attempt++) {
        result = await createCirclePost(circleId || "", text, mediaIds, mediaType);
        if (cancelledRef.current) return;

        if (result?.error?.code === "VALIDATION_ERROR" && result?.error?.message?.includes("still processing")) {
          const delay = Math.min(2000 * Math.pow(2, attempt), 8000);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        break;
      }

      if (result?.error?.code === "NOT_MEMBER") {
        setErrorType("warning");
        setErrorMessage("You need to join this circle to post. Tap the Join button on the circle feed.");
        setShowError(true);
        setPosting(false);
        return;
      }

      if (!result?.success) {
        console.error("[PostComposer] Post failed:", JSON.stringify(result?.error));
        setErrorType("failed");
        setErrorMessage(getErrorMessage(result?.error) || "Failed to create post");
        setShowError(true);
        setPosting(false);
        return;
      }

      setShowSuccess(true);
      if (circleId) {
        queryClient.invalidateQueries({ queryKey: ["circleFeedData", circleId] });
      }

      setTimeout(() => {
        setShowSuccess(false);
        router.back();
      }, 1500);
    } catch (error: any) {
      if (cancelledRef.current) return;
      console.error("Failed to create post:", error);
      setErrorType("failed");
      setErrorMessage(getErrorMessage(error) || "Something went wrong. Please try again.");
      setShowError(true);
    } finally {
      setPosting(false);
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#FFF" }}
        behavior={keyboardBehavior()}
        keyboardVerticalOffset={Platform.OS === "android" ? -insets.top : 0}
      >
        <View style={{ flex: 1, top: insets.top, paddingBottom: insets.bottom }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 12, paddingBottom: 120 }}
            keyboardShouldPersistTaps="never"
            showsVerticalScrollIndicator={false}
          >
            <XStack justifyContent="flex-end">
              {posting ? (
                <Pressable onPress={handleCancelPosting}>
                  <Text color="#FF3B30" fontWeight="600">Stop</Text>
                </Pressable>
              ) : (
                <Pressable onPress={() => { Keyboard.dismiss(); router.back(); }}>
                  <Text color="#666">Cancel</Text>
                </Pressable>
              )}
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
                  onPress={() => !posting && setImage(null)}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    borderRadius: 20,
                    padding: 6,
                    opacity: posting ? 0.4 : 1,
                  }}
                >
                  <Ionicons name="trash-outline" size={16} color="#FFF" />
                </Pressable>
              </YStack>
            )}

            {video && (
              <YStack marginTop="$3">
                <Pressable onPress={() => !posting && setVideoPlaying(!videoPlaying)} style={{ height: 120, borderRadius: 12, overflow: "hidden", backgroundColor: "#000" }}>
                  {player && (
                    <VideoView
                      player={player}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="contain"
                      nativeControls={false}
                    />
                  )}
                  <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center" }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" }}>
                      <Ionicons name={videoPlaying ? "pause" : "play"} size={20} color="#FFF" />
                    </View>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => { if (posting) return; setVideo(null); setVideoDuration(null); setVideoThumbnail(null); setVideoPlaying(false); }}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    borderRadius: 20,
                    padding: 6,
                    opacity: posting ? 0.4 : 1,
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
                if (picking || posting) return;
                setShowError(false);
                setErrorMessage("");
                setPicking(true);
                try {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== "granted") {
                  setErrorType("warning");
                  setErrorMessage("Please grant media library access in Settings to attach media.");
                  setShowError(true);
                  return;
                }
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ["images", "videos"],
                  allowsEditing: true,
                  quality: 0.8,
                });
                if (!result.canceled && result.assets?.[0]?.uri) {
                  const asset = result.assets[0];
                  if (asset.type === "video") {
                    setVideo(asset.uri);
                    setVideoDuration(asset.duration ?? null);
                    setImage(null);
                    setVideoThumbnail(null);
                    VideoThumbnails.getThumbnailAsync(asset.uri)
                      .then(({ uri }) => setVideoThumbnail(uri))
                      .catch(() => setVideoThumbnail(null));
                  } else {
                    try {
                      const convertedUri = await convertToSupportedFormat(asset.uri, asset.mimeType);
                      setImage(convertedUri);
                      setVideo(null);
                      setVideoThumbnail(null);
                      setShowError(false);
                      setErrorMessage("");
                    } catch {
                      setErrorMessage("This image format is not supported. Please use JPEG or PNG.");
                      setShowError(true);
                    }
                  }
                }
                } finally {
                  setPicking(false);
                }
              }}
              style={{ paddingVertical: 8, opacity: posting ? 0.4 : 1 }}
              disabled={posting}
            >
              {picking ? (
                <ActivityIndicator size="small" color="#333" />
              ) : (
                <Ionicons name="image-outline" size={26} color={posting ? "#999" : "#333"} />
              )}
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
              editable={!posting}
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

      <SuccessModal
        visible={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Post Created!"
        type="success"
        autoClose={false}
      />

      <SuccessModal
        visible={showError}
        onClose={() => setShowError(false)}
        title={errorType === "warning" ? "Warning" : "Error"}
        message={errorMessage}
        type={errorType}
        autoClose={false}
        withButton
        buttonText="OK"
        onButtonPress={() => setShowError(false)}
      />
    </>
  );
}
