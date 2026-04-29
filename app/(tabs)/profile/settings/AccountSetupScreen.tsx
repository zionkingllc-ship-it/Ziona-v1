import Header from "@/components/layout/header";
import { ChevronRight, Heart, Shield, User } from "@tamagui/lucide-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pressable } from "react-native";
import { Image, Text, XStack, YStack, View } from "tamagui";
import { useRouter } from "expo-router";

export default function AccountSetupScreen() {
  const router = useRouter();

  const Row = ({
    icon,
    label,
    onPress,
    showArrow = true,
  }: {
    icon: any;
    label: string;
    onPress?: () => void;
    showArrow?: boolean;
  }) => (
    <Pressable onPress={onPress}>
      <XStack
        alignItems="center"
        justifyContent="space-between"
        paddingVertical={16}
        paddingHorizontal={14}
      >
        <XStack alignItems="center" gap="$3">
          {icon}
          <Text fontSize={14}>{label}</Text>
        </XStack>

        {showArrow && <ChevronRight size={18} color="#999" />}
      </XStack>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      
      {/* HEADER */}
      <XStack padding={10} justifyContent="center">
        <Header
          heading="Account set-up"
          headerFontFamily="$body"
          headingWeight="500"
        />
      </XStack>

      {/* CARD */}
      <YStack paddingHorizontal={16} marginTop={10}>
        <View
          backgroundColor="#F4F4F4"
          borderRadius={16}
          overflow="hidden"
        >
          <Row
            icon={<Shield size={18} color="#555" />}
            label="Password and security"
            onPress={() => router.push("/settings/password")}
          />

          <Divider />

          <Row
            icon={<Heart size={18} color="#555" />}
            label="Like count"
            onPress={() => router.push("/settings/like-count")}
          />

          <Divider />

          <Row
            icon={<User size={18} color="#555" />}
            label="Deactivate or delete account"
            onPress={() => router.push("/settings/deactivate")}
          />
        </View>
      </YStack>
    </SafeAreaView>
  );
}

/* Divider */
function Divider() {
  return (
    <View
      height={0.5}
      backgroundColor="#E5E5E5"
      marginHorizontal={14}
    />
  );
}