import Header from "@/components/layout/header";
import colors from "@/constants/colors";
import { useNotificationPreferences, useUpdateNotificationPreferences } from "@/hooks/useUserSettings";
import { SafeAreaView } from "react-native-safe-area-context";
import { Switch } from "react-native";
import { Text, XStack, YStack, View } from "tamagui";

export default function NotificationScreen() {
  const { data: prefs, isLoading } = useNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();

  const updatePref = (key: string, value: boolean) => {
    try {
      updatePrefs.mutate({
        likeNotifications: key === "likeNotifications" ? value : prefs?.likeNotifications ?? true,
        replyNotifications: key === "replyNotifications" ? value : prefs?.replyNotifications ?? true,
        anchorNotifications: key === "anchorNotifications" ? value : prefs?.anchorNotifications ?? true,
        circleActivityNotifications: key === "circleActivityNotifications" ? value : prefs?.circleActivityNotifications ?? true,
        adminAnnouncements: key === "adminAnnouncements" ? value : prefs?.adminAnnouncements ?? true,
      });
    } catch (error) {
      console.log("Failed to update notification:", error);
    }
  };

  const Row = ({ label, value, onChange, disabled }: any) => (
    <XStack justifyContent="space-between" alignItems="center" paddingVertical={10}>
      <Text fontFamily="$body" fontSize={14} color={colors.black}>{label}</Text>
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
          <Header heading="Notification" />
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
        <Header heading="Notification" />
      </XStack>

      <YStack padding={16} gap="$4">
        {/* INTERACTIONS */}
        <YStack>
          <Text fontFamily="$body" fontSize={12} color={colors.gray} marginBottom={6}>
            Interactions
          </Text>

          <View backgroundColor={colors.sectionBackground} borderRadius={12} padding={12}>
            <Row
              label="Likes"
              value={prefs?.likeNotifications ?? true}
              onChange={(v: boolean) => updatePref("likeNotifications", v)}
            />
            <Row
              label="Comments"
              value={prefs?.replyNotifications ?? true}
              onChange={(v: boolean) => updatePref("replyNotifications", v)}
            />
            <Row
              label="Anchor posts"
              value={prefs?.anchorNotifications ?? true}
              onChange={(v: boolean) => updatePref("anchorNotifications", v)}
            />
            <Row
              label="Circle activity"
              value={prefs?.circleActivityNotifications ?? true}
              onChange={(v: boolean) => updatePref("circleActivityNotifications", v)}
            />
          </View>
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}