import Header from "@/components/layout/header";
import { SimpleButton } from "@/components/ui/centerTextButton";
import SuccessModal from "@/components/ui/modals/successModal";
import colors from "@/constants/colors";
import { useUpdateBio } from "@/hooks/useUpdateBio";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthStore } from "@/store/useAuthStore";
import { getNetworkModalCopy } from "@/utils/network/getNetworkModalCopy";
import { useEffect, useState } from "react";
import { TextArea, XStack, YStack,Text } from "tamagui";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditBioScreen() {
  const userId = useAuthStore((s) => s.user?.id);

  const { data: user } = useUserProfile(userId, {
    enabled: !!userId,
  });

  const mutation = useUpdateBio();

  const [bio, setBio] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"success" | "failed" | "warning">(
    "success",
  );
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  useEffect(() => {
    if (user?.bio !== undefined) {
      setBio(user.bio);
    }
  }, [user?.bio]);

  const handleSave = async () => {
    if (!bio.trim() || mutation.isPending) return;

    try {
      await mutation.mutateAsync(bio);

      setModalType("success");
      setModalTitle("Bio Updated");
      setModalMessage("Your bio has been updated successfully.");
      setModalVisible(true);
    } catch (e: any) {
      const feedback = getNetworkModalCopy(e, e?.message || "Failed to update bio");
      setModalType(feedback.type);
      setModalTitle(feedback.title);
      setModalMessage(feedback.message);
      setModalVisible(true);
    }
  };

  const charCount = bio.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <Header heading="Bio" headerFontFamily="$body" headingWeight="500" />

      <YStack flex={1} padding="$4">
      <YStack gap="$2">
        <YStack>
          <Text
            fontFamily="$body"
            fontSize={13}
            fontWeight="400"
          >
            You can update your bio at any time.
          </Text>
        </YStack>

        <TextArea
          value={bio}
          onChangeText={setBio}
          height={120}
          fontFamily="$body"
          fontSize={13}
          fontWeight="400"
          borderWidth={0.5}
          borderColor={colors.border}
          backgroundColor={colors.borderBackground}
          padding="$2"
          maxLength={100}
        />

        <XStack justifyContent="flex-end">
          <YStack>
            <Text
              fontFamily="$body"
              fontSize={13}
              fontWeight="400"
              color={colors.termsText}
            >
              {charCount}/100
            </Text>
          </YStack>
        </XStack>
      </YStack>

      <YStack marginTop="$4">
        <SimpleButton
          disabled={bio.length < 3 || mutation.isPending}
          onPress={handleSave}
          color={colors.primary}
          textColor={colors.white}
          text={mutation.isPending ? "Saving..." : "Save"}
        />
      </YStack>

      <SuccessModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        autoClose={modalType === "success"}
      />
    </YStack>
    </SafeAreaView>
  );
}
