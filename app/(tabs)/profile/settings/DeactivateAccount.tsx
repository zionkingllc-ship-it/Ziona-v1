import Header from "@/components/layout/header";
import { SimpleButton } from "@/components/ui/centerTextButton";
import SuccessModal from "@/components/ui/modals/successModal";
import colors from "@/constants/colors";
import { useAuthStore } from "@/store/useAuthStore";
import { useDeactivateAccount } from "@/hooks/useAccountSettings";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, XStack, YStack } from "tamagui";
import { useState } from "react";

export default function DeactivateAccountScreen() {
  const username = useAuthStore((s) =>  s.user?.username) || "username";
  const deactivateAccount = useDeactivateAccount();
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState(false);

  const handleDeactivate = async () => {
    try {
      await deactivateAccount.mutateAsync();
      setModalVisible(true);
    } catch (error) {
      setError(true);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      
      {/* HEADER */}
      <XStack padding={10}>
        <Header
          heading="Deactivate account"
          headerFontFamily="$body"
          headingWeight="500"
        />
      </XStack>

      {/* CONTENT */}
      <YStack flex={1} paddingHorizontal={16} marginTop={20} gap="$4">
        {/* TITLE */}
        <Text fontFamily="$body" fontSize={16} fontWeight="600" color={colors.black}>
          Deactivate account:{" "}
          <Text color={colors.primary}>@{username}</Text>
        </Text>

        {/* SUBTITLE */}
        <Text fontFamily="$body" fontSize={13} color={colors.gray}>
          If you deactivate your account?
        </Text>

        {/* BULLETS */}
        <YStack gap="$3" marginTop={10}>
          <Text fontFamily="$body" fontSize={13} color={colors.secondaryGray}>
            • No one will see your account and content
          </Text>

          <Text fontFamily="$body" fontSize={13} color={colors.secondaryGray}>
            • Ziona will continue to keep your data so that you can recover it
            when you reactivate your account
          </Text>

          <Text fontFamily="$body" fontSize={13} color={colors.secondaryGray}>
            • You can reactivate your account and recover all content anytime by
            using the same login details
          </Text>
        </YStack>
      </YStack>

      {/* BUTTON */}
      <YStack padding={16}>
        <SimpleButton
          text="Deactivate account"
          loading={deactivateAccount.isPending}
          onPress={handleDeactivate}
          color={colors.DEBIT_RED}
          textColor={colors.white}
        />
      </YStack>

      {/* SUCCESS MODAL */}
      <SuccessModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Account deactivated"
        message="Your account has been deactivated. You can reactivate by logging in again."
        type="success"
        autoClose={false}
        withButton
        buttonText="OK"
        onButtonPress={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}