import { ChevronRight, Shield, Heart, UserX } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, XStack, YStack } from "tamagui";
import { Pressable } from "react-native";
import colors from "@/constants/colors";
import { SettingsSection, SettingsRow } from "@/components/settings";

export default function AccountSetupScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      
      {/* HEADER */}
      <XStack
        alignItems="center"
        justifyContent="center"
        paddingVertical={12}
      >
        <Text fontFamily="$body" fontSize={16} fontWeight="600">
          Account set-up
        </Text>
      </XStack>

      {/* CARD */}
      <SettingsSection title="" style={{ marginHorizontal: 16, marginTop: 10 }}>
        <SettingsRow 
          icon={<Shield size={18} color={colors.secondaryGray} />}
          label="Password and security"
          onPress={() => router.push("/settings/ChangePassword")}
        />
        <SettingsRow 
          icon={<Heart size={18} color={colors.secondaryGray} />}
          label="Like count"
          onPress={() => router.push("/settings/LikeCountVisible")}
        />
        <SettingsRow 
          icon={<UserX size={18} color={colors.secondaryGray} />}
          label="Deactivate or delete account"
          onPress={() => router.push("/settings/DeactivateOrDelete")}
        />
      </SettingsSection>
    </SafeAreaView>
  );
}