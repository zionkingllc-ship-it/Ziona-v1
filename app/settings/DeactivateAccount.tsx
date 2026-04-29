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
  const username = useAuthStore((s) => s.user?.username) || "username";
  const deactivateMutation = useDeactivateAccount();
  const [modalVisible, setModalVisible] = useState(false);

  const handleDeactivate = async () => {
    try {
      await deactivateMutation.mutateAsync();
      setModalVisible(true);
    } catch (error) {
      // Handle error (already logged in mutation)
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <XStack padding={10}>
        <Header heading="Deactivate account" />
      </XStack>

      <YStack flex={1} paddingHorizontal={16} marginTop={20} gap="$4">
        <Text fontFamily="$body" fontSize={16} fontWeight="600" color={colors.black}>
          Deactivate:{" "}
          <Text color={colors.primary}>@{username}</Text>
        </Text>

        <Text fontFamily="$body" fontSize={13} color={colors.gray} marginTop={10}>
          If you deactivate your account:
        </Text>

        <YStack gap="$3" marginTop={10}>
          <Text fontFamily="$body" fontSize={13} color={colors.secondaryGray}>
            • No one will see your account and content
          </Text>
          <Text fontFamily="$body" fontSize={13} color={colors.secondaryGray}>
            • Ziona will keep your data so you can recover it when you reactivate
          </Text>
          <Text fontFamily="$body" fontSize={13} color={colors.secondaryGray}>
            • You can reactivate anytime by logging back in
          </Text>
        </YStack>
      </YStack>

      <YStack padding={16}>
        <SimpleButton
          text="Deactivate account"
          loading={deactivateMutation.isPending}
          onPress={handleDeactivate}
          color={colors.DEBIT_RED}
          textColor={colors.white}
        />
      </YStack>

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