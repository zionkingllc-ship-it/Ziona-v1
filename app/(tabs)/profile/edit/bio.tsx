import Header from "@/components/layout/header";
import { SimpleButton } from "@/components/ui/centerTextButton";
import SuccessModal from "@/components/ui/modals/successModal";
import colors from "@/constants/colors";
import { useUpdateBio } from "@/hooks/useUpdateBio";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { Input, Text, TextArea, XStack, YStack } from "tamagui";

export default function EditBioScreen() {
  const userId = useAuthStore((s) => s.user?.id);

  const { data: user } = useUserProfile(userId, {
    enabled: !!userId,
  });

  const mutation = useUpdateBio();

  const [bio, setBio] = useState("");
  const [link, setLink] = useState("");

  //  modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"success" | "failed">("success");
  const [modalMessage, setModalMessage] = useState("");


  useEffect(() => {
    if (user?.bio !== undefined) {
      setBio(user.bio);
    }
  }, [user?.bio]);

  const handleSave = async () => {
    const previousBio = user?.bio || "";

    try {
      console.log("EDIT BIO INPUT:", bio);

      await mutation.mutateAsync(bio);

      // SUCCESS FEEDBACK
      setModalType("success");
      setModalMessage("Your bio has been updated successfully.");
      setModalVisible(true);
    } catch (e: any) {
      console.log("Bio update failed", e);

      setBio(previousBio);

      //  NETWORK / SERVER ERROR FEEDBACK
      const message = e?.message?.includes("Network")
        ? "Network error. Please check your connection."
        : "Failed to update bio. Please try again later.";

      setModalType("failed");
      setModalMessage(message);
      setModalVisible(true);
    }
  };

  const charCount = bio.length;

  return (
    <YStack flex={1} backgroundColor={colors.white} padding="$4">
      {/* Header */}
      <XStack paddingLeft={5} marginTop={25} marginBottom={20}>
        <Header heading="Bio" headerFontFamily="$body" headingWeight="500" />
      </XStack>

      {/* Bio Section */}
      <YStack gap="$2">
        <Text fontFamily="$body" fontSize={13} fontWeight="400">
          You can update your bio at any time.
        </Text>

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
        />

        <XStack justifyContent="flex-end">
          <Text fontSize={11} color={colors.termsText}>
            {charCount}/100
          </Text>
        </XStack>
      </YStack>

      {/* Link Section */}
      <YStack marginTop={20} gap="$2">
        <Text fontFamily="$body" fontSize={13}>
          Add Link (Optional)
        </Text>

        <Input
          value={link}
          onChangeText={setLink}
          borderWidth={0.5}
          borderColor={colors.border}
          backgroundColor={colors.borderBackground}
          padding="$2"
        />
      </YStack>

      {/* Button */}
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
        title={modalType === "success" ? "Update Successful" : "Update failed"}
        type={modalType}
        message={modalMessage}
        autoClose
      />
    </YStack>
  );
}
