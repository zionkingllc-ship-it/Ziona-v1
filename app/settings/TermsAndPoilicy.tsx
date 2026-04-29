import Header from "@/components/layout/header";
import { ChevronRight, BookOpen, Shield, FileText } from "@tamagui/lucide-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pressable } from "react-native";
import { Text, XStack, YStack, View } from "tamagui";
import { useRouter } from "expo-router";

export default function TermsPoliciesScreen() {
  const router = useRouter();

  const Row = ({
    icon,
    label,
    onPress,
  }: {
    icon: any;
    label: string;
    onPress?: () => void;
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

        <ChevronRight size={18} color="#999" />
      </XStack>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      
      {/* HEADER */}
      <XStack padding={10}>
        <Header
          heading="Terms and policies"
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
            icon={<BookOpen size={18} color="#555" />}
            label="Community guidelines"
            onPress={() => router.push("/settings/terms/community")}
          />

          <Divider />

          <Row
            icon={<Shield size={18} color="#555" />}
            label="Privacy policy"
            onPress={() => router.push("/settings/terms/privacy")}
          />

          <Divider />

          <Row
            icon={<FileText size={18} color="#555" />}
            label="Terms of use"
            onPress={() => router.push("/settings/terms/use")}
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