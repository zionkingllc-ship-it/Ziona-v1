import Header from "@/components/layout/header";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput, Pressable, Keyboard, ActivityIndicator, Alert, KeyboardAvoidingView } from "react-native";
import { View, XStack, Text } from "tamagui";
import { isIOS, keyboardBehavior } from "@/constants/platform";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { submitHelpMessage } from "@/services/graphQL/mutation/help";
import { useAuthStore } from "@/store/useAuthStore";
import colors from "@/constants/colors";
import SuccessModal from "@/components/ui/modals/successModal";
import { AppError, getErrorMessage } from "@/utils/error";

export default function ChatInputScreen() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const user = useAuthStore((s) => s.user);
  const userName = user?.username || "User";
  const userEmail = user?.email || "";

  const handleSend = async () => {
    if (!message.trim() || submitting) return;
    setSubmitting(true);
    try {
      const result = await submitHelpMessage({
        message: message.trim(),
        email: userEmail || undefined,
        name: userName || undefined,
      });
      router.push({
        pathname: "/settings/Chat",
        params: { message: message.trim(), ticketId: result.contact?.id || "" },
      });
    } catch (err: any) {
      Alert.alert("Error", getErrorMessage(err) || "Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <Header heading="Chat with us" />

      <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={keyboardBehavior()} keyboardVerticalOffset={0}>
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
                multiline
                style={{ fontSize: 14, color: colors.black, minHeight: 80, textAlignVertical: "top" }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Pressable>

      <View padding={16}>
        <Pressable
          onPress={handleSend}
          disabled={!message.trim() || submitting}
          style={{
            backgroundColor: message.trim() && !submitting ? colors.primary : colors.inactiveButton,
            borderRadius: 8,
            paddingVertical: 14,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {submitting ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <XStack gap={8} alignItems="center">
              <Ionicons name="mail-outline" size={18} color={colors.white} />
              <Text fontFamily="$body" fontSize="$4" fontWeight="400" color={colors.white}>
                Send message
              </Text>
            </XStack>
          )}
        </Pressable>
      </View>

      <SuccessModal
        visible={showError}
        onClose={() => setShowError(false)}
        title="Error"
        message={errorMsg}
        type="failed"
        autoClose={false}
        withButton
        buttonText="OK"
        onButtonPress={() => setShowError(false)}
      />
    </SafeAreaView>
  );
}
