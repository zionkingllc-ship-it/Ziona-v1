import Header from "@/components/layout/header";
import colors from "@/constants/colors";
import { useUserSettings, useUpdateNotifications } from "@/hooks/useUserSettings";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Switch, Pressable } from "react-native";
import { Text, XStack, YStack, View } from "tamagui";
import { ChevronRight } from "@tamagui/lucide-icons";

export default function NotificationScreen() {
  const router = useRouter();
  const { data: settings, isLoading } = useUserSettings();
  const updateNotifications = useUpdateNotifications();

  const notifications = settings?.notifications;

  const updateSetting = async (key: string, value: boolean) => {
    if (!notifications) return;
    
    try {
      await updateNotifications.mutateAsync({
        ...notifications,
        [key]: value,
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
        disabled={disabled || updateNotifications.isPending}
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
        {/* IN APP */}
        <Pressable onPress={() => router.push("/profile/settings/InAppNotification")}>
          <XStack
            justifyContent="space-between"
            alignItems="center"
            backgroundColor={colors.sectionBackground}
            padding={14}
            borderRadius={12}
          >
            <Text fontFamily="$body" fontSize={14} color={colors.black}>In-app notification</Text>
            <ChevronRight size={18} color={colors.gray} />
          </XStack>
        </Pressable>

        {/* INTERACTIONS */}
        <YStack>
          <Text fontFamily="$body" fontSize={12} color={colors.gray} marginBottom={6}>
            Interactions
          </Text>

          <View backgroundColor={colors.sectionBackground} borderRadius={12} padding={12}>
            <Row
              label="Likes"
              value={notifications?.likes ?? true}
              onChange={(v: boolean) => updateSetting("likes", v)}
            />
            <Row
              label="Comments"
              value={notifications?.comments ?? true}
              onChange={(v: boolean) => updateSetting("comments", v)}
            />
            <Row
              label="New followers"
              value={notifications?.followers ?? true}
              onChange={(v: boolean) => updateSetting("followers", v)}
            />
            <Row
              label="Post you interacted with"
              value={notifications?.postInteraction ?? true}
              onChange={(v: boolean) => updateSetting("postInteraction", v)}
            />

            <Text fontFamily="$body" fontSize={11} color={colors.gray} marginTop={6}>
              Get notified when your friends comment on posts you liked or commented on.
            </Text>
          </View>
        </YStack>

        {/* CIRCLES */}
        <YStack>
          <Text fontFamily="$body" fontSize={12} color={colors.gray} marginBottom={6}>
            Circles
          </Text>

          <View backgroundColor={colors.sectionBackground} borderRadius={12} padding={12}>
            <Row
              label="Likes"
              value={notifications?.circleLikes ?? true}
              onChange={(v: boolean) => updateSetting("circleLikes", v)}
            />
            <Row
              label="Comments"
              value={notifications?.circleComments ?? true}
              onChange={(v: boolean) => updateSetting("circleComments", v)}
            />
            <Row
              label="Anchor post"
              value={notifications?.circleAnchors ?? true}
              onChange={(v: boolean) => updateSetting("circleAnchors", v)}
            />
            <Row
              label="Friend's interaction"
              value={notifications?.circleFriends ?? true}
              onChange={(v: boolean) => updateSetting("circleFriends", v)}
            />

            <Text fontFamily="$body" fontSize={11} color={colors.gray} marginTop={6}>
              Get notified when your friends interact in circles you're not part of.
            </Text>
          </View>
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}