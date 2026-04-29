import Header from "@/components/layout/header";
import TagSelectorCard from "@/components/post/TagSelectorCard";
import TextPostCardInput from "@/components/post/TextPostCardInput";
import { SimpleButton } from "@/components/ui/centerTextButton";
import BibleSelectorModal from "@/components/ui/modals/BibleSelectorModal";
import CategoryModal from "@/components/ui/modals/CategoryModal";
import SuccessModal from "@/components/ui/modals/successModal";
import PostProgressModal from "@/components/ui/modals/PostProgressModal";

import colors from "@/constants/colors";

import { usePostFeedback } from "@/hooks/usePostFeedback";
import { useResponsive } from "@/hooks/useResponsive";
import { publishDraftPost } from "@/services/graphQL/publishDraftPost";
import { useCreatePostStore } from "@/store/createPostStore";
import { getNetworkModalCopy } from "@/utils/network/getNetworkModalCopy";
import { useEffect, useState } from "react";
import { Image, ScrollView, TouchableOpacity } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { Text, XStack, YStack } from "tamagui";

/* =========================
   HELPER
========================= */

function buildReference(book: string, chapter: number, verses: number[]) {
  const sorted = [...verses].sort((a, b) => a - b);

  if (!sorted.length) return "";

  if (sorted.length === 1) {
    return `${book} ${chapter}:${sorted[0]}`;
  }

  const isContinuous = sorted.every(
    (v, i) => i === 0 || v === sorted[i - 1] + 1,
  );

  if (isContinuous) {
    return `${book} ${chapter}:${sorted[0]}-${sorted[sorted.length - 1]}`;
  }

  return `${book} ${chapter}:${sorted.join(", ")}`;
}

export default function CreateTextScreen() {
  const { wp, hp, fs } = useResponsive();

  const { draft, startDraft, setText, setCategory, setBibleVerse } =
    useCreatePostStore();

  const [categoryVisible, setCategoryVisible] = useState(false);
  const [bibleVisible, setBibleVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  const MAX_LENGTH = 500;

  /* =========================
     ENSURE TEXT DRAFT
  ========================= */

  useEffect(() => {
    if (!draft) {
      startDraft("TEXT");
    }
  }, []);

  if (!draft) return null;

  /* =========================
     DERIVED DATA (FIXED)
  ========================= */

  const verse =
    draft.type === "TEXT" || draft.type === "BIBLE"
      ? draft.bibleVerse
      : undefined;

  const translation = verse?.translation ?? "";
  const book = verse?.book ?? "";
  const chapter = verse?.chapter ?? 0;
  const verses = verse?.verses ?? [];

  const verseText = verse?.text;

  const reference =
    book && chapter && verses.length
      ? buildReference(book, chapter, verses)
      : "";

  const textValue: string = draft.type === "TEXT" ? (draft.text ?? "") : "";

  const cardColor = draft.category?.bgColor ?? "#E6E2C5";

  /* =========================
     VALIDATION
  ========================= */

  const hasText = textValue.trim().length > 0;
  const queryClient = useQueryClient();

  const canUpload = !!draft.category?.id && (hasText || !!verseText);

  /* =========================
     POST HANDLER
  ========================= */

  const feedback = usePostFeedback("/(tabs)/create");

  async function handleUpload() {
    if (!draft) return;

    if (!canUpload) {
      feedback.showError("Add required fields");
      return;
    }

    try {
      setUploading(true);

      await publishDraftPost(draft, queryClient);

      setShowProgress(true);
    } catch (error: any) {
      const networkFeedback = getNetworkModalCopy(
        error,
        error?.message || "We couldn't create your post.",
      );
      feedback.showError(networkFeedback.message, networkFeedback.type);
    } finally {
      setUploading(false);
    }
  }

  function handleProgressComplete() {
    setShowProgress(false);
    feedback.showSuccess();
  }

  /* =========================
     CHARACTER LIMIT
  ========================= */

  const combinedLength = (textValue?.length ?? 0) + (verseText?.length ?? 0);

  const remaining = MAX_LENGTH - combinedLength;

  return (
    <YStack
      style={{ flex: 1, backgroundColor: colors.white, paddingTop: hp(5) }}
    >
      <XStack marginLeft={wp(4)}>
        <Header heading="Create Post" />
      </XStack>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: wp(6),
          paddingTop: hp(1),
        }}
      >
        <YStack>
          <TextPostCardInput
            showInput={true}
            category={draft.category?.label}
            scripture={reference}
            translation={translation}
            verseText={verseText}
            value={textValue}
            onChangeText={(text) => {
              const verseLen = verseText?.length ?? 0;

              if (text.length + verseLen <= MAX_LENGTH) {
                setText(text);
              }
            }}
            backgroundColor={cardColor}
          />

          <XStack marginTop={hp(7)} marginBottom={hp(4)} gap={wp(3)}>
            <TagSelectorCard
              category={draft.category}
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

          <SimpleButton
            text={uploading ? "Posting..." : "Post"}
            textColor={colors.buttonText}
            color={colors.primary}
            disabled={uploading || !canUpload}
            onPress={handleUpload}
          />
        </YStack>
      </ScrollView>
      <CategoryModal
        visible={categoryVisible}
        onClose={() => setCategoryVisible(false)}
        onSelect={(category) => {
          setCategory(category);
          setCategoryVisible(false);
        }}
      />

      <BibleSelectorModal
        visible={bibleVisible}
        onClose={() => setBibleVisible(false)}
        onDone={(data) => {
          const newVerseLength = data.text.length;
          const currentTextLength = textValue.length;

          if (newVerseLength + currentTextLength > MAX_LENGTH) {
            feedback.showError(
              "Selected bible verse too long, Please select fewer verses to stay under 500 characters",
            );
            return;
          }

          setBibleVerse(data);
          setBibleVisible(false);
        }}
      />
      <SuccessModal
        visible={feedback.visible}
        onClose={feedback.handleClose}
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
      <PostProgressModal
        visible={showProgress}
        onComplete={handleProgressComplete}
      />
    </YStack>
  );
}
