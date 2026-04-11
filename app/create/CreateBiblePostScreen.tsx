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
import { useCreatePostStore } from "@/store/createPostStore";
import { getNetworkModalCopy } from "@/utils/network/getNetworkModalCopy";
import { useRef, useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { Image, Text, XStack, YStack } from "tamagui";

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

export default function CreateBiblePostScreen() {
  const { wp, hp, fs } = useResponsive();

  const { draft, setCategory, setBibleVerse } = useCreatePostStore();

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

  const canUpload = !!bibleDraft.category && !!bibleDraft.bibleVerse;

  /* =========================
     SUBMIT
  ========================= */

  const feedback = usePostFeedback("/(tabs)/create");

  async function handleUpload() {
    if (!canUpload) return;

    try {
      setUploading(true);
      await publishDraftPost(bibleDraft, queryClient);
      feedback.showSuccess();
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

  return (
    <YStack
      style={{ flex: 1, backgroundColor: colors.white, paddingTop: hp(5) }}
    >
      <XStack marginLeft={wp(4)}>
        <Header heading="Create Post" />
      </XStack>

      <ScrollView style={{ flex: 1 }}>
        <YStack flex={1} paddingHorizontal={wp(6)} paddingTop={hp(2)}>
          {/* PREVIEW */}

          <TextPostCardInput
            showInput={false}
            category={bibleDraft.category?.label}
            scripture={reference}
            translation={translation}
            verseText={verseText}
            value={""}
            onChangeText={() => {}}
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

          <BibleSelectorModal
            visible={bibleVisible}
            onClose={() => setBibleVisible(false)}
            onDone={(data) => {
              setBibleVerse(data);
              setBibleVisible(false);
            }}
          />
        </YStack>
      </ScrollView>

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
    </YStack>
  );
}
