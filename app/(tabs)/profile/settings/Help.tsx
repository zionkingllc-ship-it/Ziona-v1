import Header from "@/components/layout/header";
import { SimpleButton } from "@/components/ui/centerTextButton";
import colors from "@/constants/colors";
import { useRouter } from "expo-router";
import { Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, XStack, YStack } from "tamagui";

export default function HelpScreen() {
  const router = useRouter();

  const Category = ({
    title,
    onPress,
  }: {
    title: string;
    onPress?: () => void;
  }) => (
    <Pressable onPress={onPress}>
      <XStack
        justifyContent="space-between"
        alignItems="center"
        padding={14}
        borderWidth={1}
        borderColor={colors.border}
        borderRadius={10}
        marginBottom={10}
      >
        <YStack>
          <Text fontFamily="$body" fontSize={14} color={colors.black}>
            {title}
          </Text>
          <Text fontFamily="$body" fontSize={12} color={colors.gray}>
            2 articles
          </Text>
        </YStack>

        <View
          width={16}
          height={16}
          borderRadius={8}
          borderWidth={1}
          borderColor={colors.border}
        />
      </XStack>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <XStack padding={10}>
        <Header heading="Help" />
      </XStack>

      <YStack padding={16} flex={1}>
        <Text fontFamily="$body" fontSize={13} color={colors.gray}>
          Welcome @username
        </Text>

        <Text
          fontFamily="$body"
          fontSize={14}
          marginTop={4}
          marginBottom={10}
          color={colors.black}
        >
          How can we help?
        </Text>

        {/* SEARCH */}
        <View
          backgroundColor={colors.lightGrayBg}
          borderRadius={10}
          padding={10}
          marginBottom={20}
        >
          <TextInput
            placeholder="Find an answer"
            placeholderTextColor={colors.placeholderText}
            fontFamily="$body"
            fonteWeight={"400"}
          />
        </View>

        <Text
          fontFamily="$body"
          fontSize={14}
          marginBottom={10}
          color={colors.black}
        >
          Select your category
        </Text>

        <Category title="Account management" />
        <Category title="Safety and security" />
        <Category title="Safety and security" />
      </YStack>

      <View padding={16}>
        <SimpleButton
          text="Chat with us"
          color={colors.primary}
          textColor={colors.white}
          onPress={() => router.push("/profile/settings/ChatInput")}
        />
      </View>
    </SafeAreaView>
  );
}
