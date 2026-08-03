import Header from "@/components/layout/header";
import TagSelectorCard from "@/components/post/TagSelectorCard";
import { SimpleButton } from "@/components/ui/centerTextButton";
import CategoryModal from "@/components/ui/modals/CategoryModal";
import ErrorModal from "@/components/ui/modals/ErrorModal";

import colors from "@/constants/colors";
import { MAX_VIDEO_DURATION_LABEL, MAX_VIDEO_DURATION_MS } from "@/constants/videoLimits";
import { useResponsive } from "@/hooks/useResponsive";

import { useCreatePostStore } from "@/store/createPostStore";
import { MediaItem } from "@/types/createPost";
import { Trash } from "@tamagui/lucide-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";

import { useEffect, useState } from "react";
import { convertToSupportedFormat, compressImage } from "@/services/utils/imageConversion";
import { FlatList, Image, Keyboard, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";

function MediaPreviewTile({
  item,
  width,
  height,
}: {
  item: MediaItem;
  width: number;
  height: number;
}) {
  const getVideoUri = (uri: string) => uri;

  const player = useVideoPlayer(
    item.type === "VIDEO" ? getVideoUri(item.uri) : "",
    item.type === "VIDEO" ? (instance) => { instance.loop = true; } : undefined
  );

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
        contentFit="contain"
        nativeControls={false}
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
  const [picking, setPicking] = useState(false);

  /* =========================
     ENSURE DRAFT EXISTS
  ========================= */

  useEffect(() => {
    if (!draft) {
      startDraft("MEDIA", "IMAGE");
    }
  }, []);

  if (!draft || draft.type !== "MEDIA") {
    return null;
  }
  const mediaDraft = draft;
  const mediaItems = mediaDraft.media?.items ?? [];
  const hasVideo = mediaItems.some((m) => m.type === "VIDEO");
  const addDisabled = hasVideo || mediaItems.length >= 5;

  /* =========================
     NORMALIZE MEDIA
  ========================= */

  function normalizeMedia(asset: ImagePicker.ImagePickerAsset): MediaItem {
    return {
      id: asset.assetId ?? asset.uri,
      uri: asset.uri,
      type: asset.type === "video" ? "VIDEO" : "IMAGE",
      fileSize: asset.fileSize ?? undefined,
      duration: asset.duration ?? undefined,
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
    if (picking) return;
    setPicking(true);
    try {
    const allowed = await ensurePermission();
    if (!allowed) { setPicking(false); return; }

    const existing = mediaItems;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (result.canceled) { setPicking(false); return; }

    const assets = result.assets;

    const hasExistingVideo = existing.some((m) => m.type === "VIDEO");
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

      if ((video.duration ?? 0) > MAX_VIDEO_DURATION_MS) {
        setError(`Videos must be under ${MAX_VIDEO_DURATION_LABEL}.`);
        setErrorVisible(true);
        return;
      }

      setMedia([normalizeMedia(video)]);
      return;
    }

    if (hasExistingVideo) {
      setError("Cannot add media when a video is selected.");
      setErrorVisible(true);
      return;
    }

    const remainingSlots = 5 - existing.length;

    if (remainingSlots <= 0) {
      setError("Maximum 5 images allowed");
      setErrorVisible(true);
      return;
    }

    const imageAssets = assets.filter((a) => a.type !== "video");

    const converted = await Promise.all(
      imageAssets.map(async (a) => {
        const ext = a.uri?.split(".").pop()?.toLowerCase() ?? "unknown";
        let uri = await convertToSupportedFormat(a.uri, a.mimeType);
        uri = await compressImage(uri);
        return { ...a, uri };
      }),
    );

    const images = converted.map(normalizeMedia);

    if (images.length > remainingSlots) {
      setError(`Maximum 5 images allowed. You can only add ${remainingSlots} more.`);
      setErrorVisible(true);
      return;
    }

    const updated = [...existing, ...images];
    setMedia(updated);
    } catch {
      setError("Could not load that image. Try a different one.");
      setErrorVisible(true);
    } finally {
      setPicking(false);
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

      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: hp(4) }}
      >
        <View height={wp(45) + hp(2)} marginTop={hp(2)}>
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
                style={{ position: "absolute", top: 6, right: wp(2) + 6 }}
              >
                <Trash color={colors.white} size={20} />
              </TouchableOpacity>
              </YStack>
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={wp(40) + wp(2)}
            decelerationRate="fast"
            contentContainerStyle={{ paddingRight: wp(2) }}
          />
        </View>

        {mediaItems.length > 2 && (
          <XStack justifyContent="center" marginTop={hp(1.5)} gap={wp(1.5)}>
            {mediaItems.map((_, i) => (
              <View
                key={i}
                width={wp(2.5)}
                height={wp(2.5)}
                borderRadius={wp(1.25)}
                backgroundColor={i === 0 ? colors.primary : "#D9D9D9"}
              />
            ))}
          </XStack>
        )}

        <TouchableOpacity
          onPress={addDisabled || picking ? undefined : pickMedia}
          disabled={addDisabled || picking}
          style={{
            backgroundColor: addDisabled ? "#E5E3E5" : picking ? "#E5E3E5" : "#F1EFF2",
            paddingVertical: hp(0.7),
            marginTop: hp(2),
            borderRadius: 6,
            alignItems: "center",
            width: wp(40),
            opacity: addDisabled || picking ? 0.5 : 1,
          }}
        >
          <Text fontSize={fs(12)} color={addDisabled || picking ? "#A09DA0" : "#000"}>
            {picking ? "Loading..." : hasVideo ? "Video selected" : mediaItems.length >= 5 ? "Max images reached" : "Add media"}
          </Text>
        </TouchableOpacity>

        <Text marginVertical={hp(1)}>Write a caption</Text>

        <TextInput
          multiline
          value={mediaDraft.caption ?? ""}
          onChangeText={(text) => {
            if (text.length <= 500) {
              setCaption(text);
            }
          }}
          maxLength={500}
          placeholder="Write a caption..."
          placeholderTextColor={colors.placeHolderText}
          style={{
            minHeight: 35,
            maxHeight: 35,
            borderBottomWidth: 1,
            borderColor: "#E5E5E5",
            fontSize: fs(14),
            color: colors.black,
            paddingVertical: 0,
          }}
        />

        <Text
          fontSize={fs(11)}
          color={colors.gray}
          alignSelf="flex-end"
          marginTop={hp(0.5)}
        >
          {(mediaDraft.caption ?? "").length}/500
        </Text>

        <XStack marginTop={hp(3)}>
          <TagSelectorCard
            category={mediaDraft.category}
            onPress={() => {
              Keyboard.dismiss();
              setCategoryVisible(true);
            }}
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
      </ScrollView>

      {categoryVisible && (
        <CategoryModal
          visible={categoryVisible}
          onClose={() => setCategoryVisible(false)}
          onSelect={(category) => {
            setCategory(category);
            setCategoryVisible(false);
          }}
        />
      )}

      {errorVisible && (
        <ErrorModal
          visible={errorVisible}
          message={error}
          onClose={() => setErrorVisible(false)}
        />
      )}
    </YStack>
  );
}
