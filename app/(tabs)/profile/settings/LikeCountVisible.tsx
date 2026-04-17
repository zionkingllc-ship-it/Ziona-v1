import Header from "@/components/layout/header";
import colors from "@/constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, XStack, YStack, View } from "tamagui";
import { SettingsCard } from "@/components/settings";

export default function LikeCountScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <XStack padding={10}>
        <Header
          heading="Like count"
          headerFontFamily="$body"
          headingWeight="500"
        />
      </XStack>

      <YStack paddingHorizontal={16} marginTop={10}>
        <SettingsCard>
          <Text fontFamily="$body" fontSize={14} color={colors.gray}>
            Like count visibility is managed on the server. Contact support for changes.
          </Text>
        </SettingsCard>
      </YStack>
    </SafeAreaView>
  );
}