import Header from "@/components/layout/header";
import { ChevronRight } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pressable } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import colors from "@/constants/colors";

export default function DeactivateOrDeleteScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      
      {/* HEADER */}
      <XStack padding={10}>
        <Header
          heading="Delete or deactivate?"
          headerFontFamily="$body"
          headingWeight="500"
        />
      </XStack>

      <YStack paddingHorizontal={16} marginTop={20} gap="$6">

        {/* DEACTIVATE */}
        <Pressable onPress={() => router.push("/profile/settings/DeactivateAccount")}>
          <XStack justifyContent="space-between" alignItems="flex-start">
            <YStack flex={1} paddingRight={10}>
              <Text fontFamily="$body" fontSize={16} fontWeight="600" color={colors.black}>
                Deactivate
              </Text>

              <Text fontFamily="$body" fontSize={13} color={colors.gray} marginTop={6}>
                Deactivating your account will make your profile and activity unavailable to others. Your data will be restored and you can reactivate your account anytime by logging back in.
              </Text>
            </YStack>

            <ChevronRight size={18} color={colors.gray} />
          </XStack>
        </Pressable>

        {/* DELETE */}
        <Pressable onPress={() => router.push("/profile/settings/DeactivateReason")}>
          <XStack justifyContent="space-between" alignItems="flex-start">
            <YStack flex={1} paddingRight={10}>
              <Text fontFamily="$body" fontSize={16} fontWeight="600" color={colors.black}>
                Delete
              </Text>

              <Text fontFamily="$body" fontSize={13} color={colors.gray} marginTop={6}>
                Your account and all associated content will be permanently deleted. If you change your mind, you can cancel the deletion request by reactivating your account within 30 days.
              </Text>
            </YStack>

            <ChevronRight size={18} color={colors.gray} />
          </XStack>
        </Pressable>

      </YStack>
    </SafeAreaView>
  );
}