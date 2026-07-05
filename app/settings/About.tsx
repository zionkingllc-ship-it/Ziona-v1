import Header from "@/components/layout/header";
import colors from "@/constants/colors";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthStore } from "@/store/useAuthStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, XStack, YStack, View, Avatar, Image } from "tamagui";
import { useState } from "react";

function getInitials(name?: string): string {
  if (!name) return "Ur";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getColorFromName(name?: string): string {
  if (!name) return "#7A2E8A";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ["#7A2E8A", "#4A90A4", "#E58E26", "#2E8A6A", "#8A4A2E", "#4A2E8A"];
  return colors[Math.abs(hash) % colors.length];
}

export default function AboutScreen() {
  const userId = useAuthStore((s) => s.user?.id);
  const { data: profile } = useUserProfile(userId);
  const [imageError, setImageError] = useState(false);

  const avatarUrl = profile?.avatarUrl && !imageError ? profile.avatarUrl : null;
  const displayName = profile?.fullName || profile?.username || "Ziona User";
  const displayUsername = profile?.username || "username";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <Header heading="About your account" />

      <YStack padding={16} gap="$4">
        <View backgroundColor={colors.sectionBackground} borderRadius={12} padding={16}>
          <XStack alignItems="center" gap="$3">
            <Avatar circular size={60}>
              {avatarUrl ? (
                <Avatar.Image source={{ uri: avatarUrl }} onError={() => setImageError(true)} />
              ) : (
                <Avatar.Fallback backgroundColor={getColorFromName(displayName)} justifyContent="center" alignItems="center">
                  <Text color="white" fontSize={20} fontWeight="600">
                    {getInitials(displayName)}
                  </Text>
                </Avatar.Fallback>
              )}
            </Avatar>
            <YStack>
              <Text fontFamily="$body" fontSize={16} fontWeight="600" color={colors.black}>
                {displayName}
              </Text>
              <Text fontFamily="$body" fontSize={14} fontWeight="400" color={colors.gray}>
                @{displayUsername}
              </Text>
            </YStack>
          </XStack>
        </View>

        <View backgroundColor={colors.sectionBackground} borderRadius={12} padding={16}>
          <Text fontFamily="$body" fontSize={14} fontWeight="500" color={colors.black} marginBottom={12}>
            Account Details
          </Text>
          
          <YStack gap={12}>
            <XStack justifyContent="space-between">
              <Text fontFamily="$body" fontSize={14} fontWeight="400" color={colors.gray}>Member since</Text>
              <Text fontFamily="$body" fontSize={14} fontWeight="400" color={colors.black}>-</Text>
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
              <Text fontFamily="$body" fontSize={14} fontWeight="500" color={colors.black}>1.0.0</Text>
            </XStack>
          </YStack>
        </View>
      </YStack>
    </SafeAreaView>
  );
}