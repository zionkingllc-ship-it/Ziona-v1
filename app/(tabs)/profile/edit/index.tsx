import Header from "@/components/layout/header";
import EditableFieldRow from "@/components/ui/EditableFieldRow";
import SuccessModal from "@/components/ui/modals/successModal";
import colors from "@/constants/colors";
import { useUpdateAvatar } from "@/hooks/useProfileMutations";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthStore } from "@/store/useAuthStore";
import { ChevronRight } from "@tamagui/lucide-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar, Text, XStack, YStack, View } from "tamagui";

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

export default function EditProfileScreen() {
  const avatarMutation = useUpdateAvatar();

  const userId = useAuthStore((s) => s.user?.id);

  const { data: user, isLoading } = useUserProfile(userId, {
    enabled: !!userId,
  });

  const { refreshing, onRefresh } = usePullToRefresh([["userProfile", userId]]);

  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [localAvatar, user?.avatarUrl]);
  const [errorVisible, setErrorVisible] = useState(false);
  const [permissionVisible, setPermissionVisible] = useState(false);

  const handlePickImage = async () => {
    if (avatarMutation.isPending) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setPermissionVisible(true);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return;

    const asset = result.assets[0];

    setLocalAvatar(asset.uri);

    const file = {
      uri: asset.uri,
    };

    try {
      await avatarMutation.mutateAsync(file);

      setLocalAvatar(null);
      setSuccessVisible(true);
    } catch (e) {
      setLocalAvatar(null);
      setErrorVisible(true);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.white }}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <XStack>
          <Header
            heading="Edit profile"
            headerFontFamily="$body"
            headingSize={16}
            headingWeight="500"
          />
        </XStack>

        {/* Avatar */}
        <YStack alignItems="center" gap="$3" paddingVertical={19}>
          <Pressable
            onPress={handlePickImage}
            style={{ alignItems: "center", justifyContent: "center" }}
          >
            <Avatar circular width={70} height={70}>
              {localAvatar || (user?.avatarUrl && !avatarLoadFailed) ? (
                <Avatar.Image
                  source={{ uri: localAvatar || user?.avatarUrl || "" }}
                  onError={() => setAvatarLoadFailed(true)}
                />
              ) : (
                <Avatar.Fallback
                  backgroundColor={getColorFromName(user?.username)}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Text color="white" fontSize={20} fontWeight="600">
                    {getInitials(user?.username)}
                  </Text>
                </Avatar.Fallback>
              )}
            </Avatar>

            <Text
              fontFamily="$body"
              fontWeight="400"
              fontSize={13}
              color={colors.primary}
              marginTop={6}
            >
              {avatarMutation.isPending ? "Updating..." : "Change photo"}
            </Text>
          </Pressable>
        </YStack>

        {/* Info Section */}
        <YStack flex={1} gap={0} padding={20}>
          <YStack
            backgroundColor="#FAF9FA"
            borderRadius={16}
            overflow="hidden"
          >
            <EditableFieldRow
              label="Name"
              value={isLoading ? "fetching..." : user?.fullName || ""}
              onPress={() => router.push("/profile/edit/name")}
            />

            <EditableFieldRow
              label="Username"
              value={isLoading ? "fetching..." : user?.username || ""}
              onPress={() => router.push("/profile/edit/username")}
              marginTop={8}
            />
          </YStack>

          <Text
            fontFamily="$body"
            marginTop={10}
            fontSize={16}
            fontWeight="500"
          >
            More info
          </Text>

          <YStack 
            backgroundColor={"#FAF9FA"}
            justifyContent="flex-start"
            marginTop={12}
            paddingVertical={12}
            paddingHorizontal={16}
            borderRadius={16}
          >
            <Text fontFamily="$body" fontSize={16} fontWeight="400" width="30%">
              Bio
            </Text>
            <Pressable
              onPress={() => router.push("/profile/edit/bio")}
              style={{ marginTop: 8 }}
            >
              <XStack
                alignItems="center"
                paddingVertical={12}
              >
                <Text
                  fontFamily="$body"
                  fontSize={16}
                  fontWeight="500"
                  color="$gray"
                  flex={1}
                  numberOfLines={1}
                >
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

      {/*SUCCESS MODAL */}
      <SuccessModal
        visible={successVisible}
        onClose={() => setSuccessVisible(false)}
        title="Success"
        message="Profile photo updated"
        type="success"
      />

      {/* ERROR MODAL */}
      <SuccessModal
        visible={errorVisible}
        onClose={() => setErrorVisible(false)}
        title="Failed"
        message="Could not update profile photo"
        type="failed"
      />

      {/* PERMISSION MODAL */}
      <SuccessModal
        visible={permissionVisible}
        onClose={() => setPermissionVisible(false)}
        title="Permission required"
        message="Please grant media library access in Settings to change your profile picture."
        type="warning"
        autoClose={false}
        withButton
        buttonText="OK"
        onButtonPress={() => setPermissionVisible(false)}
      />
    </SafeAreaView>
  );
}
