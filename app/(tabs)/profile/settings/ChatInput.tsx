import Header from "@/components/layout/header";
import { SimpleButton } from "@/components/ui/centerTextButton";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput } from "react-native";
import { View, XStack } from "tamagui";
import { useState } from "react";
import colors from "@/constants/colors";

export default function ChatInputScreen() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <XStack padding={10}>
        <Header heading="Chat with us" />
      </XStack>

      <View padding={16} flex={1}>
        <View
          backgroundColor={colors.lightGrayBg}
          borderRadius={10}
          padding={10}
        >
          <TextInput
            placeholder="Describe your issue"
            placeholderTextColor={colors.placeholderText}
            value={message}
            onChangeText={setMessage}
            fontFamily="$body"
          />
        </View>
      </View>

      <View padding={16}>
        <SimpleButton
          text="Send message"
          color={colors.primary}
          textColor={colors.white}
          onPress={() =>
            router.push({
              pathname: "/profile/settings/Chat",
              params: { message },
            })
          }
        />
      </View>
    </SafeAreaView>
  );
}