import Header from "@/components/layout/header";
import TagSelectorCard from "@/components/post/TagSelectorCard";
import { SimpleButton } from "@/components/ui/centerTextButton";
import SuccessModal from "@/components/ui/modals/successModal";
import PostProgressModal from "@/components/ui/modals/PostProgressModal";

import colors from "@/constants/colors";
import { useResponsive } from "@/hooks/useResponsive";
import { publishMediaPost } from "@/services/graphQL/drafts/mediaDraft";
import { useCreatePostStore } from "@/store/createPostStore";
import { useAuthStore } from "@/store/useAuthStore";

import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";

import { useVideoPlayer, VideoView } from "expo-video";
import { Image, Pressable, TouchableOpacity } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";
import { Play } from "@tamagui/lucide-icons";

import { useQueryClient } from "@tanstack/react-query";
import { getNetworkModalCopy } from "@/utils/network/getNetworkModalCopy";

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
          contentFit="cover"
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

export default function CreateMediaPreviewScreen() {
  const { wp, hp, fs } = useResponsive();
  const { draft } = useCreatePostStore();
  const currentUser = useAuthStore((s) => s.user);

  const [uploading, setUploading] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const newPostIdRef = useRef<string | null>(null);

  const queryClient = useQueryClient();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<
    "success" | "failed" | "warning"
  >("success");
  const [modalMessage, setModalMessage] = useState("");

  if (!draft || draft.type !== "MEDIA") return null;

  const mediaDraft = draft;
  const media = mediaDraft.media.items[0];

  const getVideoUri = (uri: string) =>
    uri.startsWith("file://") ? uri.replace("file://", "") : uri;

  const caption = mediaDraft.caption ?? "";

  const canUpload =
    mediaDraft.media.items.length > 0 && !!mediaDraft.category?.id;

  async function handleUpload() {
    if (uploading) return;

    if (!canUpload) {
      setModalType("failed");
      setModalMessage("Add media and category");
      setModalVisible(true);
      return;
    }

    try {
      setUploading(true);

      const result = await publishMediaPost(mediaDraft, queryClient);
      newPostIdRef.current = result?.post?.id || null;

      setShowProgress(true);
    } catch (error: any) {
      const feedback = getNetworkModalCopy(
        error,
        error?.message || "Upload failed",
      );
      setModalType(feedback.type);
      setModalMessage(feedback.message);
      setModalVisible(true);
    } finally {
      setUploading(false);
    }
  }

  async function handleProgressComplete() {
    setShowProgress(false);
    await queryClient.refetchQueries({ queryKey: ["userPosts"] });
    setModalType("success");
    setModalMessage("Post uploaded successfully");
    setModalVisible(true);

    setTimeout(() => {
      if (newPostIdRef.current) {
        router.replace(`/viewer/${newPostIdRef.current}`);
      } else {
        router.replace("/(tabs)/create");
      }
    }, 1200);
  }

  const handleBack = () => {
    if (uploading) return;
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
        {media?.type === "IMAGE" && (
          <Image
            source={{ uri: media.uri }}
            style={{ width: "100%", height: "100%", opacity: uploading ? 0.5 : 1 }}
          />
        )}

        {media?.type === "VIDEO" && (
          <VideoPreview uri={getVideoUri(media.uri)} uploading={uploading} />
        )}

        <TouchableOpacity
          onPress={handleBack}
          disabled={uploading}
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
            opacity: uploading ? 0.5 : 1,
          }}
        >
          <Text color="white">✕</Text>
        </TouchableOpacity>

        <XStack
          position="absolute"
          bottom={14}
          left={14}
          right={60}
          gap={10}
          alignItems="center"
        >
          <Image
            source={
              currentUser?.avatarUrl
                ? { uri: currentUser.avatarUrl }
                : require("@/assets/images/profile.png")
            }
            width={36}
            height={36}
            borderRadius={18}
          />
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

      <XStack justifyContent="center" marginTop={hp(5)}>
        <TagSelectorCard category={mediaDraft.category} disabled={uploading} onPress={() => {}} />
      </XStack>

      <YStack marginTop={hp(3)}>
        <SimpleButton
          text={uploading ? "Uploading..." : "Upload"}
          disabled={!canUpload || uploading}
          onPress={handleUpload}
          color={colors.primary}
          textColor={colors.buttonText}
        />
      </YStack>

      {modalVisible && (
        <SuccessModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title={
            modalType === "success"
              ? "Success"
              : modalType === "warning"
                ? "Network issue"
                : "Failed"
          }
          message={modalMessage}
          type={modalType}
          autoClose
        />
      )}
      {showProgress && (
        <PostProgressModal
          visible={showProgress}
          onComplete={handleProgressComplete}
        />
      )}
      </YStack>
    </YStack>
  );
}
