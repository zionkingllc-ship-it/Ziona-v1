import { useState } from "react";
import Header from "@/components/layout/header";
import colors from "@/constants/colors";
import { useUpdateAvatar } from "@/hooks/useProfileMutations";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthStore } from "@/store/useAuthStore";
import { ChevronRight } from "@tamagui/lucide-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Pressable, RefreshControl, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar, Text, XStack, YStack } from "tamagui";

export default function EditProfileScreen() {
  const avatarMutation = useUpdateAvatar();

  const userId = useAuthStore((s) => s.user?.id);

  const { data: user, isLoading } = useUserProfile(userId, {
    enabled: !!userId,
  });

  const { refreshing, onRefresh } = usePullToRefresh([
    ["userProfile", userId],
  ]);

  //LOCAL PREVIEW STATE
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);

  const handlePickImage = async () => {
    if (avatarMutation.isPending) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,   
      aspect: [1, 1],      
      quality: 0.7,
    });

    if (result.canceled) return;

    const asset = result.assets[0];

    console.log("SELECTED IMAGE:", asset);

    // SET LOCAL PREVIEW IMMEDIATELY
    setLocalAvatar(asset.uri);

    const file = {
      uri: asset.uri,
    };

    try {
      await avatarMutation.mutateAsync(file);
    } catch (e) {
      console.log("Avatar update failed", e);

      //revert preview if backend fails
      setLocalAvatar(null);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.white, paddingTop: 20 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <XStack paddingLeft={15}>
          <Header
            heading="Edit profile"
            headerFontFamily="$body"
            headingSize={16}
            headingWeight="500"
          />
        </XStack>

        {/* Avatar */}
        <YStack alignItems="center" gap="$3" paddingVertical={19}>
          <Pressable onPress={handlePickImage}>
            <Avatar circular size="$8">
              <Avatar.Image
                source={
                  localAvatar
                    ? { uri: localAvatar } // ✅ LOCAL FIRST
                    : user?.avatarUrl
                    ? { uri: user.avatarUrl }
                    : require("@/assets/images/emptyDP.png")
                }
              />
              <Avatar.Fallback backgroundColor={colors.black} />
            </Avatar>

            <Text
              fontFamily="$body"
              fontWeight="400"
              color={colors.primary}
              marginTop={6}
            >
              {avatarMutation.isPending ? "Updating..." : "Change photo"}
            </Text>
          </Pressable>
        </YStack>

        {/* Info Section */}
        <YStack flex={1} gap="$4" padding={20}>
          <Pressable onPress={() => router.push("/profile/edit/name")}>
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={16}>Name</Text>
              <Text fontSize={16}>
                {isLoading ? "fetching..." : user?.fullName || ""}
              </Text>
              <ChevronRight size={22} color="#444" />
            </XStack>
          </Pressable>

          <Pressable onPress={() => router.push("/profile/edit/username")}>
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={16}>Username</Text>
              <Text fontSize={16}>
                {isLoading ? "fetching..." : user?.username || ""}
              </Text>
              <ChevronRight size={22} color="#444" />
            </XStack>
          </Pressable>

          <Text marginTop={10}>More info</Text>

          <YStack>
            <Text marginBottom={4}>Bio</Text>

            <Pressable onPress={() => router.push("/profile/edit/bio")}>
              <XStack justifyContent="space-between" alignItems="center">
                <Text flex={1}>
                  {isLoading
                    ? "fetching..."
                    : user?.bio || "Add a short description about you"}
                </Text>
                <ChevronRight size={22} color="#444" />
              </XStack>
            </Pressable>
          </YStack>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}