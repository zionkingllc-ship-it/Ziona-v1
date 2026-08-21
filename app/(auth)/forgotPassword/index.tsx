import { router } from "expo-router";
import { useState } from "react";
import { Image, Text, YStack } from "tamagui";

import Header from "@/components/layout/header";
import { KeyboardAvoidingWrapper } from "@/components/layout/KeyboardAvoidingWrapper";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import SuccessModal from "@/components/ui/modals/successModal";
import { TextInputWithIcon } from "@/components/ui/TextInputWithIcon";
import colors from "@/constants/colors";
import { authApi } from "@/services/api/authApi";
import { getNetworkModalCopy } from "@/utils/network/getNetworkModalCopy";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isFocus, setIsFocus] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorType, setErrorType] = useState<"success" | "failed" | "warning" | "softwarning">("failed");

  const isValidEmail = emailRegex.test(email);

  const showInvalid = attempted && !isValidEmail;

  const visualValidity: boolean | undefined =
    attempted ? (isValidEmail ? true : false) : undefined;

  const handleSendCode = async () => {
    if (loading) return;

    if (!isValidEmail) {
      setAttempted(true);
      return;
    }

    setAttempted(false);

    try {
      setLoading(true);

      await authApi.requestPasswordReset(
        email.trim().toLowerCase()
      );

      router.push({
        pathname: "/(auth)/verifyOtp",
        params: {
          email: email.trim().toLowerCase(),
          flow: "reset-password",
        },
      });
    } catch (error: any) {
      const feedback = getNetworkModalCopy(error, "Failed to send reset code. Please try again.");
      setErrorTitle(feedback.title);
      setErrorMessage(feedback.message);
      setErrorType(feedback.type as "warning" | "failed");
      setErrorVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingWrapper>
      <Header />

      <YStack
        flex={1}
        padding="$4"
        gap="$3"
        alignItems="center"
        marginTop="$10"
        width="100%"
      >
        <Image
          source={require("@/assets/images/keyIcon.png")}
          width="$7"
          height="$7"
          borderRadius="$6"
          alignSelf="center"
        />

        <YStack alignItems="center" gap="$2" padding={10}>
          <Text fontSize="$4" fontFamily="$body" fontWeight="600">
            Verify your email
          </Text>

          <Text
            fontSize="$3"
            fontFamily="$body"
            color={colors.subHeader}
            textAlign="center"
          >
            Enter your email address and we’ll send you a 6-digit OTP code
          </Text>
        </YStack>

        {/* EMAIL INPUT */}

        <YStack width="100%" gap="$2">
          <TextInputWithIcon
            value={email}
            headingText="Email"
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            isFocused={isFocus}
            isValid={visualValidity}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChangeText={(text) => {
              setEmail(text);
              setErrorVisible(false);
              setAttempted(false);
            }}
          />

          {showInvalid && (
            <Text fontSize="$3" color={colors.errorText}>
              Enter a valid email address
            </Text>
          )}
        </YStack>

        <PrimaryButton
          text="Send code"
          color={colors.primary}
          textColor={colors.white}
          disabled={loading}
          onPress={handleSendCode}
          style={{ width: "100%", marginTop: 20 }}
        />
      </YStack>

      <SuccessModal
        visible={errorVisible}
        onClose={() => setErrorVisible(false)}
        title={errorTitle}
        message={errorMessage}
        type={errorType}
      />
    </KeyboardAvoidingWrapper>
  );
}