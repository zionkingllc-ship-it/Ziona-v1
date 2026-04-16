import Header from "@/components/layout/header";
import colors from "@/constants/colors";
import { useUserSettings, useUpdatePrivacy } from "@/hooks/useUserSettings";
import * as WebBrowser from "expo-web-browser";
import { SafeAreaView } from "react-native-safe-area-context";
import { Switch } from "react-native";
import { Text, XStack, YStack, View } from "tamagui";
import { Pressable } from "react-native";

export default function PrivacyScreen() {
  const { data: settings, isLoading } = useUserSettings();
  const updatePrivacy = useUpdatePrivacy();

  const isPrivate = settings?.privacy?.privateAccount ?? false;

  const openPrivacyPolicy = () => {
    WebBrowser.openBrowserAsync("https://ziona-app.web.app/privacy");
  };

  const handlePrivateToggle = async (value: boolean) => {
    try {
      await updatePrivacy.mutateAsync({ 
        privateAccount: value,
        allowTagging: settings?.privacy?.allowTagging ?? true,
        allowMessages: settings?.privacy?.allowMessages ?? true,
      });
    } catch (error) {
      console.log("Failed to update privacy:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      {/* HEADER */}
      <XStack padding={10}>
        <Header heading="Account privacy" />
      </XStack>

      <YStack padding={16} gap="$4">
        <Text fontFamily="$body" fontSize={14} color={colors.gray}>
          Manage your privacy settings and control who can see your content.
        </Text>

        <Pressable onPress={openPrivacyPolicy}>
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

        {/* PRIVATE ACCOUNT TOGGLE */}
        <View backgroundColor={colors.sectionBackground} borderRadius={12} padding={16}>
          <XStack justifyContent="space-between" alignItems="center">
            <YStack flex={1} paddingRight={10}>
              <Text fontFamily="$body" fontSize={14} color={colors.black}>
                Private account
              </Text>
              <Text fontFamily="$body" fontSize={12} color={colors.gray} marginTop={4}>
                When enabled, only your approved followers can see your posts.
              </Text>
            </YStack>
            <Switch
              value={isPrivate}
              onValueChange={handlePrivateToggle}
              trackColor={{ false: colors.inactiveButton, true: colors.primaryDark }}
              thumbColor={colors.white}
              disabled={updatePrivacy.isPending}
            />
          </XStack>
        </View>
      </YStack>
    </SafeAreaView>
  );
}