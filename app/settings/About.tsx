import Header from "@/components/layout/header";
import colors from "@/constants/colors";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useLocationFirstTime } from "@/hooks/useLocationFirstTime";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
import { ActivityIndicator, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, XStack, YStack, View } from "tamagui";
import { APP_VERSION } from "@/constants/version";

function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "-";
  }
}

export default function AboutScreen() {
  const userId = useAuthStore((s) => s.user?.id);
  const { data: profile } = useUserProfile(userId);
  const { isLocationSetup, isChecking, permissionDenied, requestLocation, isUpdatingLocation } = useLocationFirstTime();

  const isLoadingLocation = isChecking || isUpdatingLocation;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <Header heading="About your account" />

      <YStack padding={16} gap="$4">
        <View backgroundColor={colors.sectionBackground} borderRadius={12} padding={16}>
          <Text fontFamily="$body" fontSize={14} fontWeight="500" color={colors.black} marginBottom={12}>
            Account Details
          </Text>

          <YStack gap={12}>
            <XStack justifyContent="space-between">
              <Text fontFamily="$body" fontSize={14} fontWeight="400" color={colors.gray}>Member since</Text>
              <Text fontFamily="$body" fontSize={14} fontWeight="400" color={colors.black}>{formatDate(profile?.createdAt)}</Text>
            </XStack>

            <XStack justifyContent="space-between">
              <Text fontFamily="$body" fontSize={14} fontWeight="400" color={colors.gray}>Location</Text>
              <XStack gap={6} alignItems="center">
                {isLoadingLocation && !profile?.location ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : null}
                {permissionDenied ? (
                  <Pressable onPress={requestLocation}>
                    <Text fontFamily="$body" fontSize={14} fontWeight="400" color={colors.primary}>Set your location</Text>
                  </Pressable>
                ) : (
                  <Text fontFamily="$body" fontSize={14} fontWeight="400" color={colors.black}>{profile?.location || "-"}</Text>
                )}
              </XStack>
            </XStack>

            <XStack justifyContent="space-between">
              <Text fontFamily="$body" fontSize={14} fontWeight="400" color={colors.gray}>Account status</Text>
              <Text fontFamily="$body" fontSize={14} fontWeight="500" color={colors.SUCCESS_GREEN}>Active</Text>
            </XStack>
          </YStack>
        </View>

        <View backgroundColor={colors.sectionBackground} borderRadius={12} padding={16}>
          <Text fontFamily="$body" fontSize={14} fontWeight="500" color={colors.black} marginBottom={12}>
            About Ziona
          </Text>

          <YStack gap={12}>
            <XStack justifyContent="space-between">
              <Text fontFamily="$body" fontSize={14} fontWeight="400" color={colors.gray}>Version</Text>
              <Text fontFamily="$body" fontSize={14} fontWeight="500" color={colors.black}>{APP_VERSION}</Text>
            </XStack>
          </YStack>
        </View>
      </YStack>
    </SafeAreaView>
  );
}