import { SettingsRow, SettingsSection } from "@/components/settings";
import Header from "@/components/layout/header";
import colors from "@/constants/colors";
import { useLogout } from "@/hooks/useAccountSettings";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "expo-router";
import {
  Bell,
  Bookmark,
  BookOpen,
  ChevronRight,
  FileText,
  HelpCircle,
  Lock,
  User,
} from "@tamagui/lucide-icons";
import { Image, Pressable, ScrollView, TextInput, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, XStack, YStack } from "tamagui";
import Ionicons from "@expo/vector-icons/Ionicons";

function getColorFromName(name?: string): string {
  if (!name) return "#7A2E8A";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ["#7A2E8A", "#4A90A4", "#E58E26", "#2E8A6A", "#8A4A2E", "#4A2E8A"];
  return colors[Math.abs(hash) % colors.length];
}

export default function SettingsScreen() {
  const router = useRouter();
  const logout = useLogout();
  const setOnLogoutNavigate = useAuthStore((s) => s.setHasHydrated);

  const userId = useAuthStore((s) => s.user?.id);
  const { data: profile, refetch: refetchProfile } = useUserProfile(userId);
  const [refreshing, setRefreshing] = useState(false);
  const [avatarSource, setAvatarSource] = useState<{ uri: string } | null>(null);
  const [search, setSearch] = useState("");
  const [imageError, setImageError] = useState(false);
  const initials = profile?.username?.slice(0, 2)?.toUpperCase() || "Ur";

  useEffect(() => {
    useAuthStore.setState({ onLogoutNavigate: () => router.replace("/(auth)") });

    return () => {
      useAuthStore.setState({ onLogoutNavigate: undefined });
    };
  }, []);

  useEffect(() => {
    if (profile?.avatarUrl && profile.avatarUrl.trim()) {
      setAvatarSource({ uri: profile.avatarUrl });
      setImageError(false);
    } else {
      setAvatarSource(null);
    }
  }, [profile?.avatarUrl]);

  useEffect(() => {
    if (imageError) {
      setAvatarSource(null);
    }
  }, [imageError]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchProfile();
    } catch { console.warn("[settings] refresh failed"); } finally {
      setRefreshing(false);
    }
  }, [refetchProfile]);

  const handleLogout = async () => {
    if (logout.isPending) return;
    try {
      await logout.mutateAsync();
    } catch (error) {
    }
  };

  const searchQuery = search.trim().toLowerCase();

  const settingsSections = useMemo(() => {
    const all = [
      {
        title: "Account settings",
        rows: [{ label: "Notification", route: "/settings/Notification", icon: <Bell size={18} color={colors.secondaryGray} /> }],
      },
      {
        title: "Activity",
        rows: [{ label: "Bookmarks", route: "/settings/Bookmarks", icon: <Bookmark size={18} color={colors.secondaryGray} /> }],
      },
      {
        title: "Terms and policies",
        rows: [
          { label: "Community guidelines", route: "/settings/terms/community", icon: <BookOpen size={18} color={colors.secondaryGray} /> },
          { label: "Privacy policy", route: "/settings/terms/privacy", icon: <Lock size={18} color={colors.secondaryGray} /> },
          { label: "Terms of use", route: "/settings/terms/use", icon: <FileText size={18} color={colors.secondaryGray} /> },
        ],
      },
      {
        title: "Support",
        rows: [
          { label: "Help", route: "/settings/Help", icon: <HelpCircle size={18} color={colors.secondaryGray} /> },
          { label: "About your account", route: "/settings/About", icon: <User size={18} color={colors.secondaryGray} /> },
        ],
      },
    ];

    if (!searchQuery) return all;

    return all
      .map((section) => ({
        ...section,
        rows: section.rows.filter((row) => row.label.toLowerCase().includes(searchQuery)),
      }))
      .filter((section) => section.rows.length > 0);
  }, [searchQuery]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <Header heading="Settings" />
      <ScrollView contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* SEARCH */}
        <YStack
          paddingHorizontal={12}
          marginBottom={15}
        >
          <XStack
            alignItems="center"
            backgroundColor="#F4F3F4"
            borderRadius={12}
            borderWidth={1}
            borderColor={colors.border}
            paddingLeft={12}
          >
            <Ionicons name="search" size={20} color={colors.placeHolderText} />
            <TextInput
              placeholder="Search"
              placeholderTextColor={colors.placeholderText}
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
              style={{
                flex: 1,
                height: 40,
                fontFamily: "MonaSans",
                fontSize: 14,
                color: colors.black,
                paddingHorizontal: 8,
              }}
            />
            {search.length > 0 && (
              <Pressable
                onPress={() => setSearch("")}
                style={{ paddingRight: 12 }}
                hitSlop={8}
              >
                <Ionicons name="close-circle" size={18} color={colors.gray} />
              </Pressable>
            )}
          </XStack>
        </YStack>

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
                  onError={() => setImageError(true)}
                />
              ) : (
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: getColorFromName(profile?.username),
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
                </View>
              )}
              <YStack>
                <Text fontFamily="$body" fontWeight="600" fontSize={14}>
                  {profile?.username || "Ziona User"}
                </Text>
                <Text fontFamily="$body" fontSize={12} fontWeight="400" color={colors.gray}>
                  Account set-up
                </Text>
              </YStack>
            </XStack>
            <ChevronRight size={18} color={colors.gray} />
          </XStack>
        </Pressable>

        {settingsSections.map((section, index) => (
          <SettingsSection title={section.title} key={index}>
            {section.rows.map((row, rowIndex) => (
              <SettingsRow
                key={rowIndex}
                icon={row.icon}
                label={row.label}
                onPress={() => router.push(row.route)}
              />
            ))}
          </SettingsSection>
        ))}

        {/* LOGOUT */}
        <Pressable onPress={handleLogout} disabled={logout.isPending}>
          <Text
            marginTop={30}
            alignSelf="center"
            color={logout.isPending ? colors.gray : colors.DEBIT_RED}
            fontFamily="$body"
            fontWeight="500"
          >
            {logout.isPending ? "Logging out..." : "Log out"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
