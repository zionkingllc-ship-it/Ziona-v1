import Header from "@/components/layout/header";
import { SimpleButton } from "@/components/ui/centerTextButton";
import colors from "@/constants/colors";
import { useAuthStore } from "@/store/useAuthStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, YStack } from "tamagui";
import { useRouter } from "expo-router";

export default function DeactivateAccountScreen() {
  const router = useRouter();
  const username = useAuthStore((s) => s.user?.username) || "username";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <Header heading={`Deactivate account : @${username}`} />

      <YStack flex={1} paddingHorizontal={16} marginTop={20} gap="$4">
        <Text fontFamily="$body" fontSize={16} fontWeight="600" color={colors.black}>
          If you deactivate your account?
        </Text>

        <YStack gap="$4" marginTop={10}>
          <Text fontFamily="$body" fontSize={13} fontWeight="400" color={colors.secondaryGray}>
            No one will see your account and content
          </Text>
          <Text fontFamily="$body" fontSize={13} fontWeight="400" color={colors.secondaryGray}>
            Ziona will continue to keep your data so that you can recover it when you reactivate your account
          </Text>
          <Text fontFamily="$body" fontSize={13} fontWeight="400" color={colors.secondaryGray}>
            you can reactivate your account and recover all content anytime by using the same login details
          </Text>
        </YStack>
      </YStack>

      <YStack padding={16}>
        <SimpleButton
          text="Deactivate account"
          onPress={() => router.push("/settings/DeactivateReason")}
          color={colors.DEBIT_RED}
          textColor={colors.white}
        />
      </YStack>
    </SafeAreaView>
  );
}