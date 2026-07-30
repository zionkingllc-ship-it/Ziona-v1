import { useState, useEffect, useCallback } from "react";
import Header from "@/components/layout/header";
import colors from "@/constants/colors";
import { useNotificationPreferences, useUpdateNotificationPreferences } from "@/hooks/useUserSettings";
import { SafeAreaView } from "react-native-safe-area-context";
import { Switch, RefreshControl } from "react-native";
import { ScrollView } from "react-native";
import { Text, XStack, YStack, View } from "tamagui";

type Prefs = {
  inAppLikes: boolean;
  inAppComment: boolean;
  inAppNewFollowers: boolean;
  inAppMentionAndTags: boolean;
  interactionLikes: boolean;
  interactionComment: boolean;
  interactionPostInteraction: boolean;
  interactionNewFollower: boolean;
  circleLikes: boolean;
  circleAnchorPost: boolean;
  circleComment: boolean;
  circleFriendInteraction: boolean;
};

const DEFAULTS: Prefs = {
  inAppLikes: true,
  inAppComment: true,
  inAppNewFollowers: true,
  inAppMentionAndTags: true,
  interactionLikes: true,
  interactionComment: true,
  interactionPostInteraction: true,
  interactionNewFollower: true,
  circleLikes: true,
  circleAnchorPost: true,
  circleComment: true,
  circleFriendInteraction: true,
};

export default function NotificationScreen() {
  const { data: backend, isLoading, refetch } = useNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch { console.warn("[Notification] refresh failed"); } finally {
      setRefreshing(false);
    }
  }, [refetch]);
  const [local, setLocal] = useState<Prefs>(DEFAULTS);

  // Seed local state from backend when it loads
  useEffect(() => {
    if (backend) {
      setLocal((prev) => ({
        ...prev,
        inAppLikes: backend.inAppLikes ?? prev.inAppLikes,
        inAppComment: backend.inAppComment ?? prev.inAppComment,
        inAppNewFollowers: backend.inAppNewFollowers ?? prev.inAppNewFollowers,
        inAppMentionAndTags: backend.inAppMentionAndTags ?? prev.inAppMentionAndTags,
        interactionLikes: backend.interactionLikes ?? prev.interactionLikes,
        interactionComment: backend.interactionComment ?? prev.interactionComment,
        interactionPostInteraction: backend.interactionPostInteraction ?? prev.interactionPostInteraction,
        interactionNewFollower: backend.interactionNewFollower ?? prev.interactionNewFollower,
        circleLikes: backend.circleLikes ?? prev.circleLikes,
        circleAnchorPost: backend.circleAnchorPost ?? prev.circleAnchorPost,
        circleComment: backend.circleComment ?? prev.circleComment,
        circleFriendInteraction: backend.circleFriendInteraction ?? prev.circleFriendInteraction,
      }));
    }
  }, [backend]);

  const toggle = (key: keyof Prefs, value: boolean) => {
    const updated = { ...local, [key]: value };
    setLocal(updated);
    updatePrefs.mutate(updated);
  };

  const Row = ({ label, value, onChange, disabled }: any) => (
    <XStack justifyContent="space-between" alignItems="center" paddingVertical={10}>
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
          <Header heading="Notification" />
        </XStack>
        <View flex={1} justifyContent="center" alignItems="center">
          <Text fontFamily="$body" fontWeight="400" color={colors.gray}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <Header heading="Notification" />

      <ScrollView contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <YStack gap="$5">
          {/* IN-APP NOTIFICATIONS */}
          <YStack>
            <Text fontFamily="$body" fontSize={12} fontWeight="600" color={colors.gray} marginBottom={6}>
              In-App Notification
            </Text>

            <View backgroundColor={colors.sectionBackground} borderRadius={12} padding={12}>
              <Row
                label="Likes"
                value={local.inAppLikes}
                onChange={(v: boolean) => toggle("inAppLikes", v)}
              />
              <Row
                label="Comment"
                value={local.inAppComment}
                onChange={(v: boolean) => toggle("inAppComment", v)}
              />
              <Row
                label="New followers"
                value={local.inAppNewFollowers}
                onChange={(v: boolean) => toggle("inAppNewFollowers", v)}
              />
              <Row
                label="Mention and tags"
                value={local.inAppMentionAndTags}
                onChange={(v: boolean) => toggle("inAppMentionAndTags", v)}
              />
            </View>
          </YStack>

          {/* INTERACTIONS */}
          <YStack>
            <Text fontFamily="$body" fontSize={12} fontWeight="600" color={colors.gray} marginBottom={6}>
              Interactions
            </Text>

            <View backgroundColor={colors.sectionBackground} borderRadius={12} padding={12}>
              <Row
                label="Likes"
                value={local.interactionLikes}
                onChange={(v: boolean) => toggle("interactionLikes", v)}
              />
              <Row
                label="Comment"
                value={local.interactionComment}
                onChange={(v: boolean) => toggle("interactionComment", v)}
              />
              <Row
                label="Post interaction"
                value={local.interactionPostInteraction}
                onChange={(v: boolean) => toggle("interactionPostInteraction", v)}
              />
              <Row
                label="New follower"
                value={local.interactionNewFollower}
                onChange={(v: boolean) => toggle("interactionNewFollower", v)}
              />
              <Text fontFamily="$body" fontSize={11} fontWeight="400" color={colors.gray} marginTop={8} lineHeight={16}>
                Get notified when your friends (people you follow who follow you back) comment on a friend's post that you've liked or commented on.
              </Text>
            </View>
          </YStack>

          {/* CIRCLES */}
          <YStack>
            <Text fontFamily="$body" fontSize={12} fontWeight="600" color={colors.gray} marginBottom={6}>
              Circles
            </Text>

            <View backgroundColor={colors.sectionBackground} borderRadius={12} padding={12}>
              <Row
                label="Likes"
                value={local.circleLikes}
                onChange={(v: boolean) => toggle("circleLikes", v)}
              />
              <Row
                label="Anchor post"
                value={local.circleAnchorPost}
                onChange={(v: boolean) => toggle("circleAnchorPost", v)}
              />
              <Row
                label="Comment"
                value={local.circleComment}
                onChange={(v: boolean) => toggle("circleComment", v)}
              />
              <Row
                label="Friend interaction"
                value={local.circleFriendInteraction}
                onChange={(v: boolean) => toggle("circleFriendInteraction", v)}
              />
              <Text fontFamily="$body" fontSize={11} fontWeight="400" color={colors.gray} marginTop={8} lineHeight={16}>
                Get notified when your friends (people you follow who follow you back) interact in a circle you are not a member of.
              </Text>
            </View>
          </YStack>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}