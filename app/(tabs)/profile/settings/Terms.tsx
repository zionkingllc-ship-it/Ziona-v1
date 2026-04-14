import Header from "@/components/layout/header";
import colors from "@/constants/colors";
import * as WebBrowser from "expo-web-browser";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, XStack, YStack, View } from "tamagui";
import { Pressable } from "react-native";

export default function TermsScreen() {
  const openTerms = () => {
    WebBrowser.openBrowserAsync("https://ziona-app.web.app/terms");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      {/* HEADER */}
      <XStack padding={10}>
        <Header heading="Terms and policies" />
      </XStack>

      <YStack padding={16} gap="$4">
        <Text fontFamily="$body" fontSize={14} color={colors.gray}>
          View our terms of service and privacy policies.
        </Text>

        <Pressable onPress={openTerms}>
          <View 
            backgroundColor={colors.sectionBackground} 
            borderRadius={12} 
            padding={16}
          >
            <Text fontFamily="$body" fontSize={14} color={colors.primary}>
              View Terms of Service
            </Text>
          </View>
        </Pressable>

        <Pressable onPress={openTerms}>
          <View 
            backgroundColor={colors.sectionBackground} 
            borderRadius={12} 
            padding={16}
          >
            <Text fontFamily="$body" fontSize={14} color={colors.primary}>
              View Privacy Policy
            </Text>
          </View>
        </Pressable>
      </YStack>
    </SafeAreaView>
  );
}