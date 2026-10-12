import Header from "@/components/layout/header";
import { SimpleButton } from "@/components/ui/centerTextButton";
import colors from "@/constants/colors";
import { useAuthStore } from "@/store/useAuthStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, XStack, YStack } from "tamagui";
import { useRouter } from "expo-router";

export default function DeactivateAccountScreen() {
  const router = useRouter();
  const username = useAuthStore((s) => s.user?.username) || "username";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <Header heading="Deactivate account" />

      <YStack paddingHorizontal={16} marginTop={20} gap="$4">
        <Text fontFamily="$body" fontSize={16} fontWeight="600" color={colors.black}>
          Deactivate account : @{username}
        </Text>

        <YStack gap="$4" marginTop={10}>
          <Text fontFamily="$body" fontSize={13} fontWeight="400" color={colors.secondaryGray}>
            If you deactivate your account?
          </Text>

          <XStack alignItems="center" gap={4}>
            <Text fontSize={12} fontWeight="800" lineHeight={12} color={colors.secondaryGray}>·</Text>
            <Text fontFamily="$body" fontSize={13} fontWeight="400" color={colors.secondaryGray} flex={1}>
              No one will see your account and content
            </Text>
          </XStack>
          <XStack alignItems="center" gap={4}>
            <Text fontSize={12} fontWeight="800" lineHeight={12} color={colors.secondaryGray}>·</Text>
            <Text fontFamily="$body" fontSize={13} fontWeight="400" color={colors.secondaryGray} flex={1}>
              Ziona will continue to keep your data so that you can recover it when you reactivate your account
            </Text>
          </XStack>
          <XStack alignItems="center" gap={4}>
            <Text fontSize={12} fontWeight="800" lineHeight={12} color={colors.secondaryGray}>·</Text>
            <Text fontFamily="$body" fontSize={13} fontWeight="400" color={colors.secondaryGray} flex={1}>
              you can reactivate your account and recover all content anytime by using the same login details
            </Text>
          </XStack>
        </YStack>
      </YStack>

      <YStack padding={16} marginTop={150}>
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