import Header from "@/components/layout/header";
import { SimpleButton } from "@/components/ui/centerTextButton";
import SuccessModal from "@/components/ui/modals/successModal";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, XStack, YStack, View } from "tamagui";
import { useState } from "react";
import colors from "@/constants/colors";

export default function ChatScreen() {
  const { message } = useLocalSearchParams();
  const [showModal, setShowModal] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      
      {/* HEADER */}
      <XStack padding={10}>
        <Header heading="Chat with us" />
      </XStack>

      <YStack flex={1} padding={16} gap="$3">
        {/* USER MESSAGE */}
        <XStack justifyContent="flex-end">
          <View
            backgroundColor={colors.primary}
            padding={10}
            borderRadius={14}
            maxWidth="70%"
          >
            <Text fontFamily="$body" color={colors.white}>
              {message}
            </Text>
          </View>
        </XStack>

        {/* SUPPORT RESPONSE */}
        <XStack>
          <View
            backgroundColor={colors.lightGrayBg}
            padding={10}
            borderRadius={14}
            maxWidth="70%"
          >
            <Text fontFamily="$body" fontSize={13} color={colors.black}>
              Hi, can you please give us more info on the account involved
            </Text>
          </View>
        </XStack>
      </YStack>

      {/* BUTTON */}
      <View padding={16}>
        <SimpleButton
          text="Mark as resolved"
          color={colors.inactiveButton}
          textColor={colors.black}
          onPress={() => setShowModal(true)}
        />
      </View>

      {/*SUCCESS MODAL */}
      <SuccessModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title="Message sent"
        message="Our team will get back to you shortly"
        type="success"
        autoClose={false}
        withButton
        buttonText="Got it"
        onButtonPress={() => setShowModal(false)}
      />
    </SafeAreaView>
  );
}