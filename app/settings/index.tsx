import { SettingsRow, SettingsSection } from "@/components/settings";
import colors from "@/constants/colors";
import { useLogout } from "@/hooks/useAccountSettings";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Bell,
  Bookmark,
  ChevronRight,
  FileText,
  HelpCircle,
  Lock,
  User,
} from "@tamagui/lucide-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, XStack, YStack } from "tamagui";

export default function SettingsScreen() {
  const router = useRouter();
  const logout = useLogout();
  const setOnLogoutNavigate = useAuthStore((s) => s.setHasHydrated);

  const userId = useAuthStore((s) => s.user?.id);
  const { data: profile } = useUserProfile(userId);
  const [avatarSource, setAvatarSource] = useState<{ uri: string } | null>(
    null,
  );
  const [imageError, setImageError] = useState(false);
  const initials = profile?.username?.slice(0, 2)?.toUpperCase() || "Z";

  useEffect(() => {
    useAuthStore.setState({ onLogoutNavigate: () => router.replace("/(auth)") });

    return () => {
      useAuthStore.setState({ onLogoutNavigate: undefined });
    };
  }, []);

  useEffect(() => {
    if (profile?.avatarUrl && profile.avatarUrl.trim() && !imageError) {
      setAvatarSource({ uri: profile.avatarUrl });
    } else {
      setAvatarSource(null);
    }
  }, [profile?.avatarUrl, imageError]);

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
    } catch (error) {
      console.log("Logout failed:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      {/* HEADER */}
      <Text
        fontFamily="$body"
        fontSize={18}
        fontWeight="600"
        alignSelf="center"
        marginBottom={10}
      >
        Settings
      </Text>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* SEARCH */}
        <View
          backgroundColor={colors.lightGrayBg}
          borderRadius={10}
          paddingHorizontal={12}
          paddingVertical={8}
          marginBottom={15}
        >
          <TextInput
            placeholder="Search"
            placeholderTextColor={colors.placeholderText}
          />
        </View>

        {/* PROFILE */}
        <Pressable onPress={() => router.push("/settings/AccountSetup")}>
          <XStack
            alignItems="center"
            justifyContent="space-between"
            backgroundColor={colors.sectionBackground}
            padding={12}
            borderRadius={12}
          >
            <XStack alignItems="center" gap="$3">
              {avatarSource ? (
                <Image
                  source={avatarSource}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                />
              ) : (
                <LinearGradient
                  colors={["#D396E8", "#9D4C76"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    color="white"
                    fontSize={14}
                    fontWeight="600"
                    fontFamily="$body"
                  >
                    {initials}
                  </Text>
                </LinearGradient>
              )}
              <YStack>
                <Text fontFamily="$body" fontWeight="600" fontSize={14}>
                  {profile?.username || "Ziona User"}
                </Text>
                <Text fontFamily="$body" fontSize={12} color={colors.gray}>
                  Account set-up
                </Text>
              </YStack>
            </XStack>
            <ChevronRight size={18} color={colors.gray} />
          </XStack>
        </Pressable>

        {/* ACCOUNT SETTINGS */}
        <SettingsSection title="Account settings">
          <SettingsRow
            icon={<Lock size={18} color={colors.secondaryGray} />}
            label="Password and security"
            onPress={() => router.push("/settings/ChangePassword")}
          />
          <SettingsRow
            icon={<Bell size={18} color={colors.secondaryGray} />}
            label="Notification"
            onPress={() => router.push("/settings/Notification")}
          />
          <SettingsRow
            icon={<Lock size={18} color={colors.secondaryGray} />}
            label="Account privacy"
            onPress={() => router.push("/settings/Privacy")}
          />
          <SettingsRow
            icon={<Bell size={18} color={colors.secondaryGray} />}
            label="Like counts visible"
            onPress={() => router.push("/settings/LikeCountVisible")}
          />
        </SettingsSection>

        {/* ACTIVITY */}
        <SettingsSection title="Activity">
          <SettingsRow
            icon={<Bookmark size={18} color={colors.secondaryGray} />}
            label="Bookmarks"
            onPress={() => router.push("/settings/Bookmarks")}
          />
        </SettingsSection>

        {/* SUPPORT */}
        <SettingsSection title="Support and more info">
          <SettingsRow
            icon={<HelpCircle size={18} color={colors.secondaryGray} />}
            label="Help"
            onPress={() => router.push("/settings/Help")}
          />
          <SettingsRow
            icon={<FileText size={18} color={colors.secondaryGray} />}
            label="Terms and policies"
            onPress={() => router.push("/settings/Terms")}
          />
          <SettingsRow
            icon={<User size={18} color={colors.secondaryGray} />}
            label="About your account"
            onPress={() => router.push("/settings/About")}
          />
        </SettingsSection>

        {/* LOGOUT */}
        <Pressable onPress={handleLogout}>
          <Text
            marginTop={30}
            alignSelf="center"
            color={colors.DEBIT_RED}
            fontFamily="$body"
            fontWeight="500"
          >
            Log out
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
