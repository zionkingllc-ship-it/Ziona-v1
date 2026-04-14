import Header from "@/components/layout/header";
import colors from "@/constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, XStack, YStack, View, Image, Avatar } from "tamagui";
import { useAuthStore } from "@/store/useAuthStore";

export default function AboutScreen() {
  const user = useAuthStore((s) => s.user);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      {/* HEADER */}
      <XStack padding={10}>
        <Header heading="About your account" />
      </XStack>

      <YStack padding={16} gap="$4">
        {/* PROFILE INFO */}
        <View backgroundColor={colors.sectionBackground} borderRadius={12} padding={16}>
          <XStack alignItems="center" gap="$3">
            <Avatar circular size={60}>
              <Avatar.Image 
                source={user?.avatarUrl ? { uri: user.avatarUrl } : require("@/assets/images/emptyDP.png")} 
              />
              <Avatar.Fallback backgroundColor={colors.black} />
            </Avatar>
            <YStack>
              <Text fontFamily="$body" fontSize={16} fontWeight="600" color={colors.black}>
                {user?.fullName || "Ziona User"}
              </Text>
              <Text fontFamily="$body" fontSize={14} color={colors.gray}>
                @{user?.username || "username"}
              </Text>
            </YStack>
          </XStack>
        </View>

        {/* ACCOUNT DETAILS */}
        <View backgroundColor={colors.sectionBackground} borderRadius={12} padding={16}>
          <Text fontFamily="$body" fontSize={14} fontWeight="500" color={colors.black} marginBottom={12}>
            Account Details
          </Text>
          
          <YStack gap={12}>
            <XStack justifyContent="space-between">
              <Text fontFamily="$body" fontSize={14} color={colors.gray}>Member since</Text>
              <Text fontFamily="$body" fontSize={14} color={colors.black}>-</Text>
            </XStack>
            
            <XStack justifyContent="space-between">
              <Text fontFamily="$body" fontSize={14} color={colors.gray}>Account status</Text>
              <Text fontFamily="$body" fontSize={14} color={colors.SUCCESS_GREEN}>Active</Text>
            </XStack>
          </YStack>
        </View>

        {/* APP INFO */}
        <View backgroundColor={colors.sectionBackground} borderRadius={12} padding={16}>
          <Text fontFamily="$body" fontSize={14} fontWeight="500" color={colors.black} marginBottom={12}>
            About Ziona
          </Text>
          
          <YStack gap={12}>
            <XStack justifyContent="space-between">
              <Text fontFamily="$body" fontSize={14} color={colors.gray}>Version</Text>
              <Text fontFamily="$body" fontSize={14} color={colors.black}>1.0.0</Text>
            </XStack>
          </YStack>
        </View>
      </YStack>
    </SafeAreaView>
  );
}