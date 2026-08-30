import colors from "@/constants/colors";
import { MAX_VIDEO_DURATION_MS, MAX_VIDEO_DURATION_LABEL } from "@/constants/videoLimits";
import { useAuthStore } from "@/store/useAuthStore";
import { createCirclePost } from "@/services/graphQL/mutation/circles";
import { uploadCircleMedia } from "@/services/graphQL/mutation/media/circleMediaUpload";
import { getMimeType } from "@/services/utils/mime";
import { waitForMediaProcessing } from "@/services/graphQL/mutation/media/mediaUpload";
import { saveAnchorRef, saveAnchorText, getAnchorRef, removeAnchorRef } from "@/utils/anchorRef";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import * as VideoThumbnails from "expo-video-thumbnails";
import React, { useEffect, useRef, useState } from "react";
import { convertToSupportedFormat } from "@/services/utils/imageConversion";
import {
  ActivityIndicator,
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
import { useCircleDetail, useCircleMembership } from "@/hooks/useCircles";
import { useRequireCircleMembership } from "@/hooks/useRequireCircleMembership";

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
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorType, setErrorType] = useState<"warning" | "failed">("failed");
  const [picking, setPicking] = useState(false);
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

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isJoined } = useCircleMembership(circleId || "");
  const { isLoading: circleDetailLoading } = useCircleDetail(circleId || "", { enabled: !!circleId });
  const { requireMembership, AuthModal, MembershipModal } = useRequireCircleMembership(circleId || "", isJoined);

  // Users who are not signed in (or not members of the circle) cannot type at all.
  // The hook prompts login first, then join — auth is checked before membership.
  const membershipKnown = !circleId || !circleDetailLoading;
  const blocked = !isAuthenticated || (!!circleId && !isJoined && membershipKnown);
  const prevBlocked = useRef<boolean | null>(null);

  useEffect(() => {
    if (blocked && prevBlocked.current !== true) {
      prevBlocked.current = true;
      requireMembership(() => {});
    } else if (!blocked) {
      prevBlocked.current = false;
    }
  }, [blocked, isAuthenticated, circleId, isJoined, membershipKnown, requireMembership]);

  const handleSend = async () => {
    if ((!text.trim() && !image && !video) || posting || blocked) return;

    if (video && (videoDuration ?? 0) > MAX_VIDEO_DURATION_MS) {
      const secs = Math.round((videoDuration ?? 0) / 1000);
      setErrorType("warning");
      setErrorMessage(`Videos must be under ${MAX_VIDEO_DURATION_LABEL}. This video is ${secs} seconds long.`);
      setShowError(true);
      return;
    }

    setPosting(true);

    try {
      const mediaIds: string[] = [];

      const uploadTasks: Promise<void>[] = [];
      if (image) {
        uploadTasks.push(
          uploadCircleMedia(image, getMimeType(image, "IMAGE")).then(({ mediaId }) => {
            mediaIds.push(mediaId);
          }),
        );
      }
      if (video) {
        uploadTasks.push(
          (async () => {
            const videoMedia = await uploadCircleMedia(video, getMimeType(video, "VIDEO"));
            mediaIds.push(videoMedia.mediaId);
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
          result = await createCirclePost(circleId, text, mediaIds, mediaType);

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
        setErrorType("warning");
        setErrorMessage("You need to join this circle to post. Tap the Join button on the circle feed.");
        setShowError(true);
        setPosting(false);
        return;
      }

      if (!result?.success) {
        setErrorType("failed");
        setErrorMessage(getErrorMessage(result?.error) || "Failed to create post");
        setShowError(true);
        setPosting(false);
        return;
      }

      // Re-key anchor ref from temp ID to the new post ID BEFORE invalidating queries
      const newPostId = result?.post?.id;
      if (anchorRefId && newPostId && anchorRefId.startsWith("tempAnchor_")) {
        const refData = await getAnchorRef(anchorRefId);
        if (refData) {
          await saveAnchorRef(newPostId, refData);
          await saveAnchorText(newPostId, refData.content || "");
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
    } catch (error: any) {
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
              <View style={{ borderRadius: 12, marginTop: 12 }}>
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
                    elevation: 5,
                    zIndex: 10,
                  }}
                >
                  <Ionicons name="trash" size={16} color="#FFF" />
                </Pressable>
              </View>
            )}

            {video && (
              <View style={{ borderRadius: 12, marginTop: 12 }}>
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
                  onPress={() => { setVideo(null); setVideoDuration(null); setVideoThumbnail(null); }}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    borderRadius: 20,
                    padding: 6,
                    elevation: 5,
                    zIndex: 10,
                  }}
                >
                  <Ionicons name="trash" size={16} color="#FFF" />
                </Pressable>
              </View>
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
                if (picking || blocked) return;
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
              style={{ paddingVertical: 8 }}
            >
              {picking ? (
                <ActivityIndicator size="small" color="#333" />
              ) : (
                <Ionicons name="image-outline" size={24} color="#333" />
              )}
            </Pressable>

            <TextInput
              placeholder={
                blocked
                  ? isAuthenticated
                    ? "Join this circle to comment"
                    : "Login to comment"
                  : mode === "action"
                    ? "Share your reflection..."
                    : "Write a comment..."
              }
              placeholderTextColor={colors.placeHolderText}
              value={text}
              onChangeText={setText}
              editable={!blocked}
              style={{
                flex: 1,
                paddingVertical: 8,
                minHeight: 36,
                maxHeight: 120,
                color: colors.black,
              }}
              multiline
              autoFocus={!blocked}
            />

            <Pressable onPress={handleSend} disabled={posting || blocked} style={{ paddingVertical: 8 }}>
              <View
                style={{
                  backgroundColor: !blocked && (text.trim() || image || video) && !posting ? "#6C2BD9" : "#CCC",
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

      <SuccessModal
        visible={showSuccess}
        onClose={() => setShowSuccess(false)}
        title={mode === "action" ? "Reflection Shared!" : "Comment Posted!"}
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

      {AuthModal}
      {MembershipModal}
    </>
  );
}
