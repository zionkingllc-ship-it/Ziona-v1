import Header from "@/components/layout/header";
import colors from "@/constants/colors";
import { BackendPrefs, useNotificationPreferences, useUpdateNotificationPreferences } from "@/hooks/useUserSettings";
import { SafeAreaView } from "react-native-safe-area-context";
import { Switch } from "react-native";
import { Text, XStack, YStack, View } from "tamagui";

export default function InAppNotificationScreen() {
  const { data: prefs, isLoading } = useNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();

  const updatePref = (key: keyof BackendPrefs, value: boolean) => {
    if (!prefs) return;
    const updated = { ...prefs, [key]: value };
    updatePrefs.mutate(updated);
  };

  const Row = ({ label, value, onChange, disabled }: any) => (
    <XStack justifyContent="space-between" alignItems="center" paddingVertical={12}>
      <Text fontFamily="$body" fontSize={14} fontWeight="500" color={colors.black}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.inactiveButton, true: colors.primary }}
        thumbColor={colors.white}
        disabled={disabled || updatePrefs.isPending}
      />
    </XStack>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <XStack padding={10}>
          <Header heading="In-app notification" />
        </XStack>
        <View flex={1} justifyContent="center" alignItems="center">
          <Text fontFamily="$body" fontWeight="400" color={colors.gray}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <Header heading="In-app notification" />

      <YStack padding={16}>
        <View backgroundColor={colors.sectionBackground} borderRadius={12} padding={12}>
          <Row
            label="Likes"
            value={prefs?.inAppLikes ?? false}
            onChange={(v: boolean) => updatePref("inAppLikes", v)}
          />
          <Row
            label="Comments"
            value={prefs?.inAppComment ?? false}
            onChange={(v: boolean) => updatePref("inAppComment", v)}
          />
          <Row
            label="Anchor posts"
            value={prefs?.circleAnchorPost ?? false}
            onChange={(v: boolean) => updatePref("circleAnchorPost", v)}
          />
          <Row
            label="Circle activity"
            value={prefs?.circleFriendInteraction ?? false}
            onChange={(v: boolean) => updatePref("circleFriendInteraction", v)}
          />
        </View>
      </YStack>
    </SafeAreaView>
  );
}