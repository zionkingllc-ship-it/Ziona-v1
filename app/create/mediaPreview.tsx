import Header from "@/components/layout/header";
import TagSelectorCard from "@/components/post/TagSelectorCard";
import { SimpleButton } from "@/components/ui/centerTextButton";
import SuccessModal from "@/components/ui/modals/successModal";
import PostProgressModal from "@/components/ui/modals/PostProgressModal";

import colors from "@/constants/colors";
import { useResponsive } from "@/hooks/useResponsive";
import { publishMediaPost, preUploadMedia } from "@/services/graphQL/drafts/mediaDraft";
import { movePostToFeedTop } from "@/services/feed/invalidateFeed";
import { useCreatePostStore } from "@/store/createPostStore";
import { useAuthStore } from "@/store/useAuthStore";

import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";

import { useVideoPlayer, VideoView } from "expo-video";
import { FlatList, Image, NativeScrollEvent, NativeSyntheticEvent, Pressable, TouchableOpacity } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";
import { Play } from "@tamagui/lucide-icons";

import { useQueryClient } from "@tanstack/react-query";
import { getNetworkModalCopy } from "@/utils/network/getNetworkModalCopy";
import { getMimeType } from "@/services/utils/mime";
import { isImageTypeAllowed } from "@/services/utils/imageConversion";

function VideoPreview({ uri, uploading }: { uri: string; uploading: boolean }) {
  const player = useVideoPlayer(uri, (instance) => {
    instance.loop = false;
  });
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (playing) {
      player.play();
    } else {
      player.pause();
    }
  }, [playing, player]);

  useEffect(() => {
    const sub = player.addListener("playToEnd", () => {
      player.currentTime = 0;
      setPlaying(false);
    });
    return () => sub.remove();
  }, [player]);

  return (
    <View style={{ width: "100%", height: "100%", backgroundColor: "black" }}>
      <Pressable
        onPress={() => setPlaying((p) => !p)}
        disabled={uploading}
        style={{ width: "100%", height: "100%", opacity: uploading ? 0.5 : 1 }}
      >
        <VideoView
          player={player}
          style={{ width: "100%", height: "100%" }}
          contentFit="contain"
          nativeControls={false}
        />

        {!playing && (
          <View
            style={{
              position: "absolute",
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: "#FFF1DB",
              justifyContent: "center",
              alignItems: "center",
              alignSelf: "center",
              top: "50%",
              marginTop: -30,
            }}
          >
            <Play size={28} color="black" fill="black" />
          </View>
        )}
      </Pressable>
    </View>
  );
}

import { Image as ExpoImage } from "expo-image";

function getInitials(name?: string): string {
  if (!name) return "Ur";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getColorFromName(name?: string): string {
  if (!name) return "#7A2E8A";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ["#7A2E8A", "#4A90A4", "#E58E26", "#2E8A6A", "#8A4A2E", "#4A2E8A"];
  return colors[Math.abs(hash) % colors.length];
}

function AuthorAvatar({ username, avatarUrl }: { username?: string; avatarUrl?: string | null }) {
  const [failed, setFailed] = useState(false);
  const hasValidUri = avatarUrl && avatarUrl.trim() && !failed;

  if (!hasValidUri) {
    const initials = getInitials(username);
    const bgColor = getColorFromName(username);
    return (
      <View width={36} height={36} borderRadius={18} backgroundColor={bgColor} alignItems="center" justifyContent="center">
        <Text color="white" fontSize={13} fontWeight="600">{initials}</Text>
      </View>
    );
  }

  return (
    <ExpoImage
      source={{ uri: avatarUrl }}
      style={{ width: 36, height: 36, borderRadius: 18 }}
      onError={() => setFailed(true)}
    />
  );
}

export default function CreateMediaPreviewScreen() {
  const { wp, hp, fs } = useResponsive();
  const { draft } = useCreatePostStore();
  const resetDraft = useCreatePostStore((s) => s.resetDraft);
  const currentUser = useAuthStore((s) => s.user);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const progressRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preUploadedRef = useRef<{ mediaIds: string[]; mediaUrls: string[] } | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const items = draft?.type === "MEDIA" ? draft.media?.items : undefined;
    if (!items?.length) return;
    preUploadMedia(items).then((result) => {
      preUploadedRef.current = result;
    });
  }, []);


  const queryClient = useQueryClient();

  useEffect(() => {
    if (!showProgress) return;
    const interval = setInterval(() => {
      setUploadProgress(progressRef.current);
    }, 150);
    return () => clearInterval(interval);
  }, [showProgress]);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<
    "success" | "failed" | "warning"
  >("success");
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  if (!draft || draft.type !== "MEDIA") return null;

  const mediaDraft = draft;
  const items = mediaDraft.media.items;

  const getVideoUri = (uri: string) => uri;
  const cardWidth = wp(100) - wp(12);

  const caption = mediaDraft.caption ?? "";

  const canUpload = items.length > 0 && !!mediaDraft.category?.id;

  function handleCancel() {
    cancelledRef.current = true;
    setShowProgress(false);
  }

  async function handleUpload() {
    if (showProgress) return;

    if (!canUpload) {
      setModalType("failed");
      setModalTitle("Required Fields");
      setModalMessage("Add media and category");
      setModalVisible(true);
      return;
    }

    const oversizedVideo = items.find(
      (m) => m.type === "VIDEO" && (m.fileSize ?? 0) > 120 * 1024 * 1024,
    );
    if (oversizedVideo) {
      setModalType("failed");
      setModalTitle("Video Too Large");
      setModalMessage("Video should not be more than 120MB.");
      setModalVisible(true);
      return;
    }

    cancelledRef.current = false;
    progressRef.current = 0;
    setUploadProgress(0);
    setShowProgress(true);

    const onProgress = (pct: number) => {
      progressRef.current = pct;
    };

    try {
      const result = await publishMediaPost(
        mediaDraft,
        queryClient,
        onProgress,
        preUploadedRef.current ?? undefined,
      );

      if (cancelledRef.current) return;

      setUploadProgress(100);

      if (result?.post?.id) {
        await queryClient.refetchQueries({ queryKey: ["forYouFeed"], exact: true });
        movePostToFeedTop(queryClient, result.post.id, result.post);
      }
      await queryClient.refetchQueries({ queryKey: ["userPosts"] });
      setShowProgress(false);
      setModalType("success");
      setModalTitle("Success");
      setModalMessage("Post uploaded successfully");
      setModalVisible(true);

      timeoutRef.current = setTimeout(() => {
        setModalVisible(false);
        resetDraft();
        router.replace("/(tabs)/feed");
      }, 1500);
    } catch (error: any) {
      if (cancelledRef.current) return;
      setShowProgress(false);
      const feedback = getNetworkModalCopy(
        error,
        error?.message || "Upload failed",
      );
      setModalType(feedback.type);
      setModalTitle(feedback.title);
      setModalMessage(feedback.message);
      setModalVisible(true);
    }
  }

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
    setCurrentPage(page);
  };

  const handleBack = () => {
    if (showProgress) return;
    router.back();
  };

  return (
    <YStack
      flex={1}
      backgroundColor={colors.white}
      paddingTop={hp(5)}
    >
      <Header heading="Preview" />

      <YStack paddingHorizontal={wp(6)} flex={1}>
      <View
        style={{
          width: "100%",
          height: hp(55),
          borderRadius: 10,
          overflow: "hidden",
          marginTop: hp(2),
        }}
      >
        <FlatList
          data={items}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          renderItem={({ item }) => (
            <View width={cardWidth} height="100%">
              {item.type === "IMAGE" ? (
                <Image
                  source={{ uri: item.uri }}
                  style={{ width: "100%", height: "100%", opacity: showProgress ? 0.5 : 1 }}
                  resizeMode="cover"
                />
              ) : (
                <View width={cardWidth} height="100%">
                  <VideoPreview uri={getVideoUri(item.uri)} uploading={showProgress} />
                </View>
              )}
            </View>
          )}
          keyExtractor={(item) => item.id}
        />

        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.25)",
          }}
          pointerEvents="none"
        />

        <TouchableOpacity
          onPress={handleBack}
          disabled={showProgress}
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            backgroundColor: "#00000088",
            width: 26,
            height: 26,
            borderRadius: 13,
            alignItems: "center",
            justifyContent: "center",
            opacity: showProgress ? 0.5 : 1,
          }}
        >
          <Text color="white">✕</Text>
        </TouchableOpacity>

        <View
          style={{
            position: "absolute",
            bottom: 14,
            left: 14,
            right: 60,
          }}
        >
          {items.length > 1 && (
            <XStack justifyContent="center" marginBottom={hp(1)} gap={wp(1.5)}>
              {items.map((_, i) => (
                <View
                  key={i}
                  width={wp(2.5)}
                  height={wp(2.5)}
                  borderRadius={wp(1.25)}
                  backgroundColor={i === currentPage ? "white" : "rgba(255,255,255,0.4)"}
                />
              ))}
            </XStack>
          )}

          <XStack gap={10} alignItems="center">
            <AuthorAvatar username={currentUser?.username} avatarUrl={currentUser?.avatarUrl} />
            <YStack flex={1}>
              <Text color="white" fontFamily="$body" fontSize={13} fontWeight="600">
                {currentUser?.username || "User"}
              </Text>
              {caption ? (
                <Text
                  color="white"
                  fontFamily="$body"
                  fontSize={12}
                  numberOfLines={2}
                >
                  {caption}
                </Text>
              ) : null}
            </YStack>
          </XStack>
        </View>
      </View>

      <XStack justifyContent="center" marginTop={hp(5)}>
        <TagSelectorCard category={mediaDraft.category} disabled={showProgress} onPress={() => {}} />
      </XStack>

      <YStack marginTop={hp(3)}>
        <SimpleButton
          text={showProgress ? "Uploading..." : "Upload"}
          disabled={!canUpload || showProgress}
          onPress={handleUpload}
          color={colors.primary}
          textColor={colors.buttonText}
        />
      </YStack>

      {modalVisible && (
        <SuccessModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title={modalTitle}
          message={modalMessage}
          type={modalType}
          autoClose
        />
      )}
      {showProgress && (
        <PostProgressModal
          visible={showProgress}
          progress={uploadProgress}
          onCancel={handleCancel}
        />
      )}
      </YStack>
    </YStack>
  );
}
