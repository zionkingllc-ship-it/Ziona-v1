import Header from "@/components/layout/header";
import { SimpleButton } from "@/components/ui/centerTextButton";
import SuccessModal from "@/components/ui/modals/successModal";
import colors from "@/constants/colors";
import { useUpdateBio } from "@/hooks/useUpdateBio";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthStore } from "@/store/useAuthStore";
import { getNetworkModalCopy } from "@/utils/network/getNetworkModalCopy";
import { AppError, getErrorMessage } from "@/utils/error";
import { useEffect, useState } from "react";
import { TextArea, XStack, YStack, Text, Input } from "tamagui";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditBioScreen() {
  const userId = useAuthStore((s) => s.user?.id);

  const { data: user } = useUserProfile(userId, {
    enabled: !!userId,
  });

  const mutation = useUpdateBio();

  const [bio, setBio] = useState("");
  const [bioLink, setBioLink] = useState("");
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
    if (user?.bioLink !== undefined) {
      setBioLink(user.bioLink ?? "");
    }
  }, [user?.bio, user?.bioLink]);

  const handleSave = async () => {
    if (mutation.isPending) return;
    if (!bio.trim() && !bioLink.trim()) return;

    try {
      await mutation.mutateAsync({
        bio: bio.trim(),
        bioLink: bioLink.trim() || undefined,
      });

      setModalType("success");
      setModalTitle("Updated");
      setModalMessage("Your changes have been saved successfully.");
      setModalVisible(true);
    } catch (e: any) {
      const feedback = getNetworkModalCopy(e, getErrorMessage(e) || "Failed to update bio");
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
            borderColor="#EEEBEF"
            backgroundColor="#FAF9FA"
            borderRadius={8}
            padding="$2"
            maxLength={100}
          />

          <XStack justifyContent="flex-end">
            <YStack>
              <Text
                fontFamily="$body"
                fontSize={13}
                fontWeight="400"
                color={colors.placeHolderText}
              >
                {charCount}/100
              </Text>
            </YStack>
          </XStack>
        </YStack>

        <YStack marginTop="$4" gap="$2">
          <Text
            fontFamily="$body"
            fontSize={13}
            fontWeight="500"
          >
            Add link <Text color={colors.placeHolderText}>(optional)</Text>
          </Text>
          <Input
            value={bioLink}
            onChangeText={setBioLink}
            placeholder="https://instagram.com/yourhandle"
            fontFamily="$body"
            fontSize={13}
            fontWeight="400"
            borderWidth={0.5}
            borderColor="#EEEBEF"
            backgroundColor="#FAF9FA"
            borderRadius={8}
            padding="$2"
            marginTop={8}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </YStack>

<SimpleButton
          disabled={mutation.isPending || (!bio.trim() && !bioLink.trim())}
          onPress={handleSave}
          color={colors.primary}
          textColor={colors.white}
          text={mutation.isPending ? "Saving..." : "Save"}
          style={{ marginTop: 20 }}
        />

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
