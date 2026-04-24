import Header from "@/components/layout/header";
import colors from "@/constants/colors";
import { useUserProfile } from "@/hooks/useUserProfile";
import { updateProfile } from "@/services/profile/profileService";
import { SafeAreaView } from "react-native-safe-area-context";
import { Switch } from "react-native";
import { Text, XStack, YStack, View } from "tamagui";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";

export default function LikeCountScreen() {
  const userId = useAuthStore((s) => s.user?.id);
  const { data: profile } = useUserProfile(userId || "");
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const toggleLikeCount = useMutation({
    mutationFn: async (hide: boolean) => {
      setIsPending(true);
      await updateProfile({ hideLikeCount: hide });
    },
    onSuccess: () => {
      setIsPending(false);
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
    },
    onError: () => setIsPending(false),
  });

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
        <View backgroundColor={colors.sectionBackground} borderRadius={12} padding={16}>
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontFamily="$body" fontSize={14}>
              Hide like count
            </Text>
            <Switch
              value={profile?.hideLikeCount ?? false}
              onValueChange={(v: boolean) => toggleLikeCount.mutate(v)}
              trackColor={{ false: colors.inactiveButton, true: colors.primary }}
              thumbColor={colors.white}
              disabled={isPending}
            />
          </XStack>
          <Text fontFamily="$body" fontSize={12} color={colors.gray} marginTop={8}>
            When enabled, like counts won't be shown on your posts
          </Text>
        </View>
      </YStack>
    </SafeAreaView>
  );
}