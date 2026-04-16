import { ChevronRight, Lock, Bell, Bookmark, HelpCircle, FileText, User } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, TextInput, Pressable } from "react-native";
import { Text, View, XStack, YStack, Avatar } from "tamagui";
import colors from "@/constants/colors";
import { SettingsSection, SettingsRow } from "@/components/settings";
import { useAuthStore } from "@/store/useAuthStore";
import { useLogout } from "@/hooks/useAccountSettings";

export default function SettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
    } catch (error) {
      console.log("Logout failed:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        
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
            fontFamily="$body"
          />
        </View>

        {/* PROFILE */}
        <Pressable 
          onPress={() => router.push("/profile/edit")}
          pressStyle={{ opacity: 0.7 }}
        >
          <XStack
            alignItems="center"
            justifyContent="space-between"
            backgroundColor={colors.sectionBackground}
            padding={12}
            borderRadius={12}
          >
            <XStack alignItems="center" gap="$3">
              <Avatar circular size={40}>
                <Avatar.Image source={require("@/assets/images/emptyDP.png")} />
                <Avatar.Fallback backgroundColor={colors.black} />
              </Avatar>
              <YStack>
                <Text fontFamily="$body" fontWeight="600" fontSize={14}>
                  {user?.fullName || "Ziona User"}
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
            icon={<Bell size={18} color={colors.secondaryGray} />} 
            label="Notification" 
            onPress={() => router.push("/profile/settings/Notification")}
          />
          <SettingsRow 
            icon={<Lock size={18} color={colors.secondaryGray} />} 
            label="Account privacy" 
            onPress={() => router.push("/profile/settings/Privacy")}
          />
        </SettingsSection>

        {/* ACTIVITY */}
        <SettingsSection title="Activity">
          <SettingsRow 
            icon={<Bookmark size={18} color={colors.secondaryGray} />} 
            label="Bookmarks" 
            onPress={() => router.push("/profile/settings/Bookmarks")}
          />
        </SettingsSection>

        {/* SUPPORT */}
        <SettingsSection title="Support and more info">
          <SettingsRow 
            icon={<HelpCircle size={18} color={colors.secondaryGray} />} 
            label="Help" 
            onPress={() => router.push("/profile/settings/Help")}
          />
          <SettingsRow 
            icon={<FileText size={18} color={colors.secondaryGray} />} 
            label="Terms and policies" 
            onPress={() => router.push("/profile/settings/Terms")}
          />
          <SettingsRow 
            icon={<User size={18} color={colors.secondaryGray} />} 
            label="About your account" 
            onPress={() => router.push("/profile/settings/About")}
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