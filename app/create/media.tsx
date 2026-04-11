import Header from "@/components/layout/header";
import TagSelectorCard from "@/components/post/TagSelectorCard";
import { SimpleButton } from "@/components/ui/centerTextButton";
import CategoryModal from "@/components/ui/modals/CategoryModal";
import ErrorModal from "@/components/ui/modals/ErrorModal";

import colors from "@/constants/colors";
import { useResponsive } from "@/hooks/useResponsive";

import { useCreatePostStore } from "@/store/createPostStore";
import { MediaItem } from "@/types/createPost";
import { Trash } from "@tamagui/lucide-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";

import { useEffect, useState } from "react";
import { FlatList, Image, Platform, TextInput, TouchableOpacity } from "react-native";
import { Text, XStack, YStack } from "tamagui";

function MediaPreviewTile({
  item,
  width,
  height,
}: {
  item: MediaItem;
  width: number;
  height: number;
}) {
  const player = useVideoPlayer(item.type === "VIDEO" ? item.uri : null, (instance) => {
    instance.loop = true;
  });

  if (item.type === "VIDEO") {
    return (
      <VideoView
        player={player}
        style={{
          width,
          height,
          borderRadius: 6,
          marginRight: 8,
        }}
        contentFit="cover"
        nativeControls={false}
        surfaceType={Platform.OS === "android" ? "textureView" : undefined}
      />
    );
  }

  return (
    <Image
      source={{ uri: item.uri }}
      style={{
        width,
        height,
        borderRadius: 6,
        marginRight: 8,
      }}
    />
  );
}

export default function CreateMediaScreen() {
  const { wp, hp, fs } = useResponsive();

  const { draft, startDraft, setCaption, setMedia, setCategory } =
    useCreatePostStore();

  const [categoryVisible, setCategoryVisible] = useState(false);
  const [error, setError] = useState("");
  const [errorVisible, setErrorVisible] = useState(false);

  /* =========================
     ENSURE DRAFT EXISTS
  ========================= */

  useEffect(() => {
    if (!draft) {
      startDraft("MEDIA", "IMAGE");
    }
  }, []);

  if (!draft || draft.type !== "MEDIA") return null;
  const mediaDraft = draft;
  const mediaItems = mediaDraft.media?.items ?? [];
  /* =========================
     NORMALIZE MEDIA
  ========================= */

  function normalizeMedia(asset: ImagePicker.ImagePickerAsset): MediaItem {
    return {
      id: asset.assetId ?? asset.uri,
      uri: asset.uri,
      type: asset.type === "video" ? "VIDEO" : "IMAGE",
    };
  }

  /* =========================
     PERMISSION
  ========================= */

  async function ensurePermission() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      setError("Permission required");
      setErrorVisible(true);
      return false;
    }

    return true;
  }

  /* =========================
     PICK MEDIA
  ========================= */

  async function pickMedia() {
    const allowed = await ensurePermission();
    if (!allowed) return;

    const existing = mediaItems;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (result.canceled) return;

    const assets = result.assets;

    const video = assets.find((a) => a.type === "video");

    if (video) {
      if (existing.length > 0) {
        setError("Cannot add video when images exist.");
        setErrorVisible(true);
        return;
      }

      if (assets.length > 1) {
        setError("Only one video allowed");
        setErrorVisible(true);
        return;
      }

      setMedia([normalizeMedia(video)]);
      router.push("/create/mediaPreview");
      return;
    }

    const remainingSlots = 5 - existing.length;

    if (remainingSlots <= 0) {
      setError("Maximum 5 images allowed");
      setErrorVisible(true);
      return;
    }

    const images = assets
      .filter((a) => a.type !== "video")
      .slice(0, remainingSlots)
      .map(normalizeMedia);

    const updated = [...existing, ...images];
    setMedia(updated);

    if (existing.length === 0 && updated.length > 0) {
      router.push("/create/mediaPreview");
    }
  }

  function removeMedia(id: string) {
    setMedia(mediaItems.filter((m) => m.id !== id));
  }

  /* =========================
     UI
  ========================= */

  return (
    <YStack
      flex={1}
      backgroundColor={colors.white}
      paddingTop={hp(5)}
      paddingHorizontal={wp(6)}
    >
      <Header heading="Add details" />

      <YStack>
        <FlatList
          data={mediaItems}
          renderItem={({ item }) => (
            <YStack>
              {item.type === "VIDEO" ? (
                <MediaPreviewTile item={item} width={wp(40)} height={wp(45)} />
              ) : (
                <Image
                  source={{ uri: item.uri }}
                  style={{
                    width: wp(40),
                    height: wp(45),
                    borderRadius: 6,
                    marginRight: wp(2),
                  }}
                />
              )}

              <TouchableOpacity
                onPress={() => removeMedia(item.id)}
                style={{ position: "absolute", top: "40%", left: "40%" }}
              >
                <Trash color={colors.white} size={24} />
              </TouchableOpacity>
            </YStack>
          )}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ marginTop: hp(2) }}
        />

        <TouchableOpacity
          onPress={pickMedia}
          style={{
            backgroundColor: "#F1EFF2",
            paddingVertical: hp(0.7),
            marginTop: hp(2),
            borderRadius: 6,
            alignItems: "center",
            width: wp(40),
          }}
        >
          <Text fontSize={fs(12)}>Add media</Text>
        </TouchableOpacity>

        <Text marginVertical={hp(1)}>Write a caption</Text>

        <TextInput
          multiline
          value={mediaDraft.caption ?? ""}
          onChangeText={setCaption}
          maxLength={100}
          style={{
            minHeight: hp(8),
            borderBottomWidth: 1,
            borderColor: "#E5E5E5",
          }}
        />
      </YStack>

      <XStack marginTop={hp(3)}>
        <TagSelectorCard
          category={mediaDraft.category}
          onPress={() => setCategoryVisible(true)}
        />
      </XStack>

      <YStack marginTop={hp(7)} marginBottom={hp(4)}>
        <SimpleButton
          text="Preview"
          onPress={() => router.push("/create/mediaPreview")}
          disabled={!mediaDraft.category.id || mediaItems.length === 0}
          color={colors.primary}
          textColor={colors.buttonText}
        />
      </YStack>

      <CategoryModal
        visible={categoryVisible}
        onClose={() => setCategoryVisible(false)}
        onSelect={(category) => {
          setCategory(category);
          setCategoryVisible(false);
        }}
      />

      <ErrorModal visible={false} message="" onClose={() => {}} />
    </YStack>
  );
}
