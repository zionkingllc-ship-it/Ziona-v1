import Header from "@/components/layout/header";
import colors from "@/constants/colors";
import { useUserSettings, useUpdateNotifications } from "@/hooks/useUserSettings";
import { SafeAreaView } from "react-native-safe-area-context";
import { Switch } from "react-native";
import { Text, XStack, YStack, View } from "tamagui";

export default function InAppNotificationScreen() {
  const { data: settings, isLoading } = useUserSettings();
  const updateNotifications = useUpdateNotifications();

  const updateSetting = async (key: string, value: boolean) => {
    if (!settings?.notifications) return;
    
    try {
      await updateNotifications.mutateAsync({
        ...settings.notifications,
        [key]: value,
      });
    } catch (error) {
      console.log("Failed to update notification:", error);
    }
  };

  const Row = ({ label, value, onChange, disabled }: any) => (
    <XStack justifyContent="space-between" alignItems="center" paddingVertical={12}>
      <Text fontFamily="$body" fontSize={14} color={colors.black}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.inactiveButton, true: colors.primary }}
        thumbColor={colors.white}
        disabled={disabled || updateNotifications.isPending}
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
          <Text fontFamily="$body" color={colors.gray}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <XStack padding={10}>
        <Header heading="In-app notification" />
      </XStack>

      <YStack padding={16}>
        <View backgroundColor={colors.sectionBackground} borderRadius={12} padding={12}>
          <Row
            label="Likes"
            value={settings?.notifications?.likes ?? false}
            onChange={(v: boolean) => updateSetting("likes", v)}
          />
          <Row
            label="Comments"
            value={settings?.notifications?.comments ?? false}
            onChange={(v: boolean) => updateSetting("comments", v)}
          />
          <Row
            label="New followers"
            value={settings?.notifications?.followers ?? false}
            onChange={(v: boolean) => updateSetting("followers", v)}
          />
          <Row
            label="Mention and tags"
            value={settings?.notifications?.comments ?? false}
            onChange={(v: boolean) => updateSetting("comments", v)}
          />
        </View>
      </YStack>
    </SafeAreaView>
  );
}