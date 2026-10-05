import Header from "@/components/layout/header";
import colors from "@/constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, XStack, YStack, View } from "tamagui";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      {/* HEADER */}
      <Header heading="Terms and policies" />

      <YStack padding={16} gap="$4">
        <Text fontFamily="$body" fontSize={14} fontWeight="400" color={colors.gray}>
          View our terms of service and privacy policies.
        </Text>

        <Pressable onPress={() => router.push("/settings/terms/use")}>
          <View 
            backgroundColor={colors.sectionBackground} 
            borderRadius={12} 
            padding={16}
          >
            <Text fontFamily="$body" fontSize={14} fontWeight="500" color={colors.primary}>
              View Terms of Service
            </Text>
          </View>
        </Pressable>

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
      </YStack>
    </SafeAreaView>
  );
}