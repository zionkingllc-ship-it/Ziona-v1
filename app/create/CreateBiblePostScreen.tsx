import Header from "@/components/layout/header";
import TagSelectorCard from "@/components/post/TagSelectorCard";
import TextPostCardInput from "@/components/post/TextPostCardInput";
import { SimpleButton } from "@/components/ui/centerTextButton";
import BibleSelectorModal from "@/components/ui/modals/BibleSelectorModal";
import CategoryModal from "@/components/ui/modals/CategoryModal";
import SuccessModal from "@/components/ui/modals/successModal";
import colors from "@/constants/colors";
import { usePostFeedback } from "@/hooks/usePostFeedback";
import { useResponsive } from "@/hooks/useResponsive";
import { queryClient } from "@/lib/queryClient";
import { publishDraftPost } from "@/services/graphQL/publishDraftPost";
import { invalidateFeed, movePostToFeedTop } from "@/services/feed/invalidateFeed";
import { useCreatePostStore } from "@/store/createPostStore";
import { getNetworkModalCopy } from "@/utils/network/getNetworkModalCopy";
import { shortenBookName } from "@/utils/bibleNames";
import { useState } from "react";
import { ActivityIndicator, Modal, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Image, Text, View, XStack, YStack } from "tamagui";

/* =========================
   HELPER
========================= */

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

export default function CreateBiblePostScreen() {
  const { wp, hp, fs } = useResponsive();

  const draft = useCreatePostStore((s) => s.draft);
  const setCategory = useCreatePostStore((s) => s.setCategory);
  const setBibleVerse = useCreatePostStore((s) => s.setBibleVerse);
  const resetDraft = useCreatePostStore((s) => s.resetDraft);

  const [categoryVisible, setCategoryVisible] = useState(false);
  const [bibleVisible, setBibleVisible] = useState(true); // auto open
  const [uploading, setUploading] = useState(false);

  /* =========================
     TYPE SAFETY
  ========================= */

  if (!draft || draft.type !== "BIBLE") {
    return null;
  }

  const bibleDraft = draft;

  /* =========================
     DERIVED DATA
  ========================= */

  const verse = bibleDraft.bibleVerse;

  const translation = verse?.translation ?? "";
  const book = verse?.book ?? "";
  const chapter = verse?.chapter ?? 0;
  const verses = verse?.verses ?? [];

  const verseText = verse?.text;

  const reference =
    book && chapter && verses.length
      ? buildReference(book, chapter, verses)
      : "";

  const cardColor = bibleDraft.category?.bgColor ?? "#E6E2C5";

  /* =========================
     LIMIT
  ========================= */

  const verseLength = verseText?.length ?? 0;
  const remaining = Math.max(500 - verseLength, 0);

  /* =========================
     VALIDATION
  ========================= */

  const canUpload = !!bibleDraft.category?.id && !!bibleDraft.bibleVerse;

  /* =========================
     SUBMIT
  ========================= */

  const feedback = usePostFeedback("/(tabs)/create");

  async function handleUpload() {
    if (!canUpload) return;

    try {
      setUploading(true);
      const result = await publishDraftPost(bibleDraft, queryClient);
      resetDraft();
      await invalidateFeed(queryClient);
      if (result?.post?.id) {
        await queryClient.refetchQueries({ queryKey: ["forYouFeed"], exact: true });
        movePostToFeedTop(queryClient, result.post.id);
      }
      await queryClient.refetchQueries({ queryKey: ["userPosts"] });
      setUploading(false);
      setTimeout(() => {
        router.replace("/(tabs)/feed");
      }, 500);
    } catch (error: any) {
      setUploading(false);
      const networkFeedback = getNetworkModalCopy(
        error,
        error?.message || "We couldn't create your post.",
      );
      feedback.showError(networkFeedback.message, networkFeedback.type);
    }
  }

  return (
    <YStack
      style={{ flex: 1, backgroundColor: colors.white, paddingTop: hp(5) }}
    >
      <Header heading="Create Post" />

      <ScrollView style={{ flex: 1 }}>
        <YStack flex={1} paddingHorizontal={wp(6)} paddingTop={hp(2)}>
          {/* PREVIEW */}

          <TextPostCardInput
            showInput={false}
            category={bibleDraft.category?.label}
            scripture={reference}
            translation={translation}
            verseText={verseText}
            backgroundColor={cardColor}
            maxLength={500}
          />

          {/* ACTIONS */}

          <XStack flex={1} marginTop={hp(7)} marginBottom={hp(4)} gap={wp(3)}>
            <TagSelectorCard
              category={bibleDraft.category}
              onPress={() => setCategoryVisible(true)}
            />

            <TouchableOpacity
              style={{
                flex: 0.4,
                backgroundColor: "#F4F3F4",
                borderRadius: wp(2),
                paddingVertical: hp(2),
                alignItems: "center",
              }}
              onPress={() => setBibleVisible(true)}
            >
              <Image
                source={require("@/assets/images/bibleIcon2.png")}
                style={{
                  width: wp(6),
                  height: wp(6),
                  marginBottom: hp(1),
                }}
              />

              <Text fontSize={fs(14)} fontWeight="500">
                Bible verse
              </Text>

              <Text fontSize={fs(11)} color="#8A7F87">
                {reference ? "Change verse" : "Choose a verse"}
              </Text>
            </TouchableOpacity>
          </XStack>

          {/* POST */}

          <SimpleButton
            text={uploading ? "Posting..." : "Post"}
            textColor={colors.buttonText}
            color={colors.primary}
            disabled={uploading || !canUpload}
            onPress={handleUpload}
          />

          {/* CATEGORY */}

          <CategoryModal
            visible={categoryVisible}
            onClose={() => setCategoryVisible(false)}
            onSelect={(category) => {
              setCategory(category);
              setCategoryVisible(false);
            }}
          />

          {/* BIBLE */}

          {bibleVisible && (
            <BibleSelectorModal
              visible={bibleVisible}
              onClose={() => setBibleVisible(false)}
              onDone={(data) => {
                setBibleVerse(data);
              }}
            />
          )}
        </YStack>
      </ScrollView>

      <Modal transparent animationType="fade" visible={uploading} statusBarTranslucent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 30, alignItems: "center", minWidth: 250 }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text marginTop={16} fontSize={16} fontWeight="500" fontFamily="$body">Creating post...</Text>
          </View>
        </View>
      </Modal>

      <SuccessModal
        visible={feedback.visible}
        onClose={() => {
          feedback.handleClose();
        }}
        title={
          feedback.type === "success"
            ? "Success"
            : feedback.type === "warning"
              ? "Network issue"
              : "Failed"
        }
        message={feedback.message}
        type={feedback.type}
        autoClose
      />
    </YStack>
  );
}
