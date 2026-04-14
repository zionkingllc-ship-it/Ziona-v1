import Header from "@/components/layout/header";
import colors from "@/constants/colors";
import { useUserSettings, useUpdateLikeCountVisibility } from "@/hooks/useUserSettings";
import { SafeAreaView } from "react-native-safe-area-context";
import { Switch } from "react-native";
import { Text, XStack, YStack, View } from "tamagui";
import { SettingsCard } from "@/components/settings";

export default function LikeCountScreen() {
  const { data: settings, isLoading } = useUserSettings();
  const updateLikeCount = useUpdateLikeCountVisibility();

  const hideLikes = settings?.likeCountVisible === false;

  const handleToggle = async (value: boolean) => {
    try {
      await updateLikeCount.mutateAsync(!value);
    } catch (error) {
      console.log("Failed to update like count visibility:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      
      {/* HEADER */}
      <XStack padding={10}>
        <Header
          heading="Like count"
          headerFontFamily="$body"
          headingWeight="500"
        />
      </XStack>

      {/* CARD */}
      <YStack paddingHorizontal={16} marginTop={10}>
        <SettingsCard>
          <XStack justifyContent="space-between" alignItems="center">
            <YStack flex={1} paddingRight={10}>
              <Text fontFamily="$body" fontSize={14} fontWeight="500" color={colors.black}>
                Hide like count
              </Text>

              <Text
                fontFamily="$body"
                fontSize={12}
                color={colors.gray}
                marginTop={4}
              >
                Choose whether or not to display the number of likes on your posts.
              </Text>
            </YStack>

            <Switch
              value={hideLikes}
              onValueChange={handleToggle}
              trackColor={{ false: colors.inactiveButton, true: colors.primaryDark }}
              thumbColor={colors.white}
              disabled={updateLikeCount.isPending}
            />
          </XStack>
        </SettingsCard>
      </YStack>
    </SafeAreaView>
  );
}