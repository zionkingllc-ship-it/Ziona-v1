import { SimpleButton } from "@/components/ui/centerTextButton";
import TagSelectorCard from "@/components/post/TagSelectorCard";
import TextPostCardInput from "@/components/post/TextPostCardInput";
import colors from "@/constants/colors";
import { useResponsive } from "@/hooks/useResponsive";
import { generateVideoThumbnail } from "@/helpers/thumbnailGenerator";
import { runPostUpload } from "@/services/upload/postUploadController";
import { useCreatePostStore } from "@/store/createPostStore";
import { useUploadStore } from "@/store/uploadStore";
import { shortenBookName } from "@/utils/bibleNames";

import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView } from "react-native";
import { Image } from "expo-image";
import { AlertCircle, Play } from "@tamagui/lucide-icons";
import { Text, View, XStack, YStack } from "tamagui";

import { useQueryClient } from "@tanstack/react-query";
import { emitAppEvent } from "@/src/data/eventBus";

const PLACEHOLDER_MEDIA =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=60";

function buildReference(book: string, chapter: number, verses: number[]) {
  const sorted = [...verses].sort((a, b) => a - b);

  if (!sorted.length) return "";

  const shortBook = shortenBookName(book);

  if (sorted.length === 1) {
    return `${shortBook} ${chapter}:${sorted[0]}`;
  }

  const isContinuous = sorted.every(
    (v, i) => i === 0 || v === sorted[i - 1] + 1,
  );

  if (isContinuous) {
    return `${shortBook} ${chapter}:${sorted[0]}-${sorted[sorted.length - 1]}`;
  }

  return `${shortBook} ${chapter}:${sorted.join(", ")}`;
}

export default function UploadProgressScreen() {
  const { wp, hp, fs, insets } = useResponsive();
  const queryClient = useQueryClient();

  const draft = useCreatePostStore((s) => s.draft);
  const resetDraft = useCreatePostStore((s) => s.resetDraft);

  const status = useUploadStore((s) => s.status);
  const progress = useUploadStore((s) => s.progress);
  const error = useUploadStore((s) => s.error);
  const postId = useUploadStore((s) => s.postId);

  const [videoThumb, setVideoThumb] = useState<string | null>(null);

  const firstItem =
    draft?.type === "MEDIA" ? draft.media.items[0] : undefined;

  const isMedia = draft?.type === "MEDIA";
  const mediaCaption = draft?.type === "MEDIA" ? draft.caption ?? "" : "";
  const mediaUri = firstItem?.uri ?? PLACEHOLDER_MEDIA;

  const verse =
    draft?.type === "TEXT" || draft?.type === "BIBLE"
      ? draft.bibleVerse
      : undefined;

  const translation = verse?.translation ?? "";
  const verseText = verse?.text ?? "";
  const textValue = draft?.type === "TEXT" ? draft.text ?? "" : "";

  const reference =
    verse?.book && verse?.chapter && (verse?.verses?.length ?? 0)
      ? buildReference(verse.book, verse.chapter, verse.verses)
      : "";

  const cardColor = draft?.category?.bgColor ?? "#E6E2C5";

  const uploading = status === "uploading";
  const completed = status === "completed";
  const failed = status === "failed";

  /* =========================
     START UPLOAD
  ========================= */

  useEffect(() => {
    useUploadStore.getState().setExited(false);

    if (firstItem?.type === "VIDEO") {
      generateVideoThumbnail(firstItem.uri).then(setVideoThumb);
    }

    runPostUpload(queryClient);

    return () => {
      const s = useUploadStore.getState();
      if (s.status === "uploading") s.setExited(true);
    };
  }, []);

  /* =========================
     STATE TRANSITIONS
  ========================= */

  useEffect(() => {
    if (status === "completed") {
      resetDraft();
      emitAppEvent({
        type: "feed_scroll_to_top",
        timestamp: Date.now(),
        data: { postId },
      });
      router.replace("/(tabs)/feed");
    } else if (status === "cancelled") {
      useUploadStore.getState().reset();
      router.back();
    }
  }, [status]);

  if (!draft) return null;

  /* =========================
     ACTIONS
  ========================= */

  function handleExitToFeed() {
    useUploadStore.getState().setExited(true);
    router.replace("/(tabs)/feed");
  }

  function handleCancel() {
    useUploadStore.getState().requestCancel();
    useUploadStore.getState().setStatus("cancelled");
  }

  function handleRetry() {
    runPostUpload(queryClient);
  }

  const overlay = (radius: number) => (
    <>
      {uploading && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: radius,
            backgroundColor: "rgba(0,0,0,0.35)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text color={colors.white} fontSize={fs(15)} fontFamily="$body">
            Uploading...
          </Text>
          <Text
            color={colors.white}
            fontSize={fs(36)}
            fontWeight="700"
            fontFamily="$body"
            marginTop={hp(0.5)}
          >
            {Math.floor(progress)}%
          </Text>
        </View>
      )}

      {completed && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: radius,
            backgroundColor: "rgba(0,0,0,0.5)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="large" color={colors.secondary} />
          <Text
            color={colors.white}
            fontSize={fs(18)}
            fontWeight="600"
            fontFamily="$body"
            marginTop={hp(1.5)}
          >
            Processing...
          </Text>
        </View>
      )}

      {failed && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: radius,
            backgroundColor: "rgba(0,0,0,0.5)",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: wp(8),
          }}
        >
          <AlertCircle size={48} color="#F87171" />
          <Text
            color={colors.white}
            fontSize={fs(18)}
            fontWeight="600"
            fontFamily="$body"
            marginTop={hp(1.5)}
          >
            Upload failed
          </Text>
          <Text
            color="#E5E0E8"
            fontSize={fs(13)}
            fontFamily="$body"
            textAlign="center"
            marginTop={hp(0.8)}
          >
            {error?.message ?? "Something went wrong. Please try again."}
          </Text>
        </View>
      )}
    </>
  );

  return (
    <YStack flex={1} backgroundColor={colors.white}>
      {isMedia ? (
        <YStack flex={1} justifyContent="center" paddingHorizontal={wp(6)}>
          {/* ================= MEDIA PREVIEW ================= */}
          <View
            style={{
              alignSelf: "center",
              width: 245,
              height: 267,
              borderRadius: 2,
              borderWidth: 1,
              borderColor: colors.primary,
              overflow: "hidden",
              backgroundColor: "#000",
            }}
          >
            {firstItem?.type === "IMAGE" || firstItem?.type === undefined ? (
              <Image
                source={{ uri: mediaUri }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                transition={150}
              />
            ) : (
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#1c1b1e",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {videoThumb ? (
                  <Image
                    source={{ uri: videoThumb }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                    transition={150}
                  />
                ) : (
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: "#ffffff22",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Play size={26} color="#fff" fill="#fff" />
                  </View>
                )}
              </View>
            )}
            {/* ================= OVERLAY ================= */}
            {overlay(2)}
          </View>

          {/* ================= CAPTION ================= */}
          {mediaCaption ? (
            <Text
              fontFamily="$body"
              fontSize={fs(13)}
              color={colors.text}
              textAlign="center"
              numberOfLines={3}
              lineHeight={fs(19)}
              paddingHorizontal={wp(10)}
              marginTop={hp(3)}
            >
              {mediaCaption}
            </Text>
          ) : null}

          {/* ================= CATEGORY CARD ================= */}
          <XStack justifyContent="center" marginTop={hp(3)}>
            <TagSelectorCard category={draft.category} onPress={() => {}} />
          </XStack>
        </YStack>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: wp(6),
            paddingTop: 90,
            paddingBottom: Math.max(insets.bottom, hp(2)),
          }}
        >
          <YStack style={{ position: "relative" }}>
            {/* ================= TEXT PREVIEW ================= */}
            <TextPostCardInput
              showInput={false}
              category={draft.category?.label}
              scripture={reference}
              translation={translation}
              verseText={verseText}
              value={textValue}
              onChangeText={() => {}}
              backgroundColor={cardColor}
              maxLength={500}
            />
            {/* ================= OVERLAY ================= */}
            {overlay(wp(4))}
          </YStack>

          {/* ================= ACTIONS ================= */}
          {!completed && (
            <YStack marginTop={80}>
              <SimpleButton
                text={failed ? "Try again" : "Exit and continue uploading"}
                textColor={colors.buttonText}
                color={colors.primary}
                borderRadius={10}
                onPress={failed ? handleRetry : handleExitToFeed}
              />

              <Pressable
                onPress={handleCancel}
                disabled={failed}
                style={{
                  marginTop: hp(2),
                  paddingVertical: hp(1),
                  alignItems: "center",
                  opacity: failed ? 0.6 : 1,
                }}
              >
                <Text
                  fontFamily="$body"
                  fontSize={fs(14)}
                  color={colors.gray}
                  textAlign="center"
                >
                  Cancel upload
                </Text>
              </Pressable>
            </YStack>
          )}
        </ScrollView>
      )}

      {/* ================= MEDIA ACTIONS ================= */}
      {isMedia && !completed && (
        <YStack
          paddingHorizontal={wp(6)}
          paddingBottom={Math.max(insets.bottom, hp(2))}
        >
          <SimpleButton
            text={failed ? "Try again" : "Exit and continue uploading"}
            textColor={colors.buttonText}
            color={colors.primary}
            borderRadius={10}
            onPress={failed ? handleRetry : handleExitToFeed}
          />

          <Pressable
            onPress={handleCancel}
            disabled={failed}
            style={{
              marginTop: hp(2),
              paddingVertical: hp(1),
              alignItems: "center",
              opacity: failed ? 0.6 : 1,
            }}
          >
            <Text
              fontFamily="$body"
              fontSize={fs(14)}
              color={colors.gray}
              textAlign="center"
            >
              Cancel upload
            </Text>
          </Pressable>
        </YStack>
      )}
    </YStack>
  );
}