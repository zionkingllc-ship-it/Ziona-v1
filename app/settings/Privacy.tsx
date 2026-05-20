import Header from "@/components/layout/header";
import colors from "@/constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, XStack, YStack, View } from "tamagui";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <XStack padding={10}>
        <Header heading="Account privacy" />
      </XStack>

      <YStack padding={16} gap="$4">
        <Text fontFamily="$body" fontSize={14} fontWeight="400" color={colors.gray}>
          Manage your privacy settings and control who can see your content.
        </Text>

        <Pressable onPress={() => router.push("/settings/terms/privacy")}>
          <View 
            backgroundColor={colors.sectionBackground} 
            borderRadius={12} 
            padding={16}
          >
            <Text fontFamily="$body" fontSize={14} fontWeight="500" color={colors.primary}>
              View Privacy Policy
            </Text>
          </View>
        </Pressable>

        <View backgroundColor={colors.sectionBackground} borderRadius={12} padding={16}>
          <Text fontFamily="$body" fontSize={14} fontWeight="400" color={colors.gray}>
            Privacy settings are managed on the server. Contact support for changes.
          </Text>
        </View>
      </YStack>
    </SafeAreaView>
  );
}