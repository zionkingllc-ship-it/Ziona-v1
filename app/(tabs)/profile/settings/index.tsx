import { ChevronRight, Lock, Bell, Bookmark, HelpCircle, FileText, User } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, TextInput } from "react-native";
import { Text, View, XStack, YStack, Image } from "tamagui";
import colors from "@/constants/colors";

export default function SettingsScreen() {
  const router = useRouter();

  const Row = ({ icon, label, onPress }: any) => (
    <XStack
      alignItems="center"
      justifyContent="space-between"
      paddingVertical={14}
      paddingHorizontal={12}
      onPress={onPress}
    >
      <XStack alignItems="center" gap="$3">
        {icon}
        <Text fontSize={14}>{label}</Text>
      </XStack>
      <ChevronRight size={18} color="#999" />
    </XStack>
  );

  const Section = ({ title, children }: any) => (
    <YStack marginTop={20}>
      <Text fontSize={13} color="#888" marginBottom={6}>
        {title}
      </Text>

      <YStack
        backgroundColor="#F5F5F5"
        borderRadius={12}
        overflow="hidden"
      >
        {children}
      </YStack>
    </YStack>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        
        {/* HEADER */}
        <Text fontSize={18} fontWeight="600" alignSelf="center" marginBottom={10}>
          Settings
        </Text>

        {/* SEARCH */}
        <View
          backgroundColor="#F2F2F2"
          borderRadius={10}
          paddingHorizontal={12}
          paddingVertical={8}
          marginBottom={15}
        >
          <TextInput placeholder="Search" />
        </View>

        {/* PROFILE */}
        <XStack
          alignItems="center"
          justifyContent="space-between"
          backgroundColor="#F5F5F5"
          padding={12}
          borderRadius={12}
          onPress={() => router.push("/profile/edit")}
        >
          <XStack alignItems="center" gap="$3">
            <Image
              source={require("@/assets/images/emptyDP.png")}
              width={40}
              height={40}
              borderRadius={20}
            />
            <YStack>
              <Text fontWeight="600">Ziona kay</Text>
              <Text fontSize={12} color="#888">
                Account set-up
              </Text>
            </YStack>
          </XStack>

          <ChevronRight size={18} color="#999" />
        </XStack>

        {/* ACCOUNT SETTINGS */}
        <Section title="Account settings">
          <Row icon={<Bell size={18} />} label="Notification" />
          <Row icon={<Lock size={18} />} label="Account privacy" />
        </Section>

        {/* ACTIVITY */}
        <Section title="Activity">
          <Row icon={<Bookmark size={18} />} label="Bookmarks" />
        </Section>

        {/* SUPPORT */}
        <Section title="Support and more info">
          <Row icon={<HelpCircle size={18} />} label="Help" />
          <Row icon={<FileText size={18} />} label="Terms and policies" />
          <Row icon={<User size={18} />} label="About your account" />
        </Section>

        {/* LOGOUT */}
        <Text
          marginTop={30}
          alignSelf="center"
          color="red"
          fontWeight="500"
          onPress={() => {
            // hook your logout here
          }}
        >
          Log out
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}