import Header from "@/components/layout/header";
import TagSelectorCard from "@/components/post/TagSelectorCard";
import { SimpleButton } from "@/components/ui/centerTextButton";
import SuccessModal from "@/components/ui/modals/successModal";

import colors from "@/constants/colors";
import { useResponsive } from "@/hooks/useResponsive";
import { publishMediaPost } from "@/services/graphQL/drafts/mediaDraft";
import { useCreatePostStore } from "@/store/createPostStore";
import { useAuthStore } from "@/store/useAuthStore";

import { router } from "expo-router";
import { useEffect, useState } from "react";

import { useVideoPlayer, VideoView } from "expo-video";
import { Image, Platform, Pressable } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";
import { Play, Pause } from "@tamagui/lucide-icons";

import { useQueryClient } from "@tanstack/react-query";
import { getNetworkModalCopy } from "@/utils/network/getNetworkModalCopy";

export default function CreateMediaPreviewScreen() {
  const { wp, hp, fs } = useResponsive();
  const { draft } = useCreatePostStore();
  const currentUser = useAuthStore((s) => s.user);

  const [uploading, setUploading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const queryClient = useQueryClient();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<
    "success" | "failed" | "warning"
  >("success");
  const [modalMessage, setModalMessage] = useState("");
  const [progress, setProgress] = useState(0);

  if (!draft || draft.type !== "MEDIA") return null;

  const mediaDraft = draft;
  const media = mediaDraft.media.items[0];

  const player = useVideoPlayer(media?.type === "VIDEO" ? media.uri : null);

  useEffect(() => {
    if (player) {
      if (isPlaying) {
        player.play();
      } else {
        player.pause();
      }
    }
  }, [isPlaying, player]);

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
      setProgress(0);

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 15;
        });
      }, 150);

      await publishMediaPost(mediaDraft, queryClient);

      clearInterval(interval);
      setProgress(100);

      await new Promise((resolve) => setTimeout(resolve, 500));

      setModalType("success");
      setModalMessage("Post uploaded successfully");
      setModalVisible(true);

      setTimeout(() => {
        router.replace("/(tabs)/create");
      }, 1200);
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

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <YStack
      flex={1}
      backgroundColor={colors.white}
      paddingTop={hp(5)}
      paddingHorizontal={wp(6)}
    >
      <Header heading="Preview" />

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
          <Pressable
            onPress={togglePlay}
            style={{ width: "100%", height: "100%" }}
          >
            <Image
              source={{ uri: media.uri }}
              style={{ width: "100%", height: "100%" }}
            />
          </Pressable>
        )}

        {media?.type === "VIDEO" && (
          <View style={{ width: "100%", height: "100%", backgroundColor: "black" }}>
            <Pressable
              onPress={togglePlay}
              style={{ width: "100%", height: "100%" }}
            >
              <VideoView
                player={player}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                nativeControls={false}
                surfaceType={Platform.OS === "android" ? "textureView" : undefined}
              />

              {!isPlaying && (
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
                  <Play size={28} color={colors.black} fill={colors.black} />
                </View>
              )}
            </Pressable>
          </View>
        )}

        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            router.back();
          }}
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
          }}
        >
          <Text color="white">✕</Text>
        </Pressable>

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

      {uploading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.35)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 28,
              fontWeight: "700",
            }}
          >
            {Math.floor(progress)}%
          </Text>
        </View>
      )}

      <XStack justifyContent="center" marginTop={hp(5)}>
        <TagSelectorCard category={mediaDraft.category} disabled onPress={() => {}} />
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
    </YStack>
  );
}
