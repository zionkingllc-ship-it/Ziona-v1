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
  const [loading, setLoading] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isValidEmail = emailRegex.test(email);

  const showInvalid = isFocus && email.length > 0 && !isValidEmail;

  const visualValidity: boolean | undefined =
    !isFocus ? undefined : showInvalid ? false : true;

  const handleSendCode = async () => {
    if (!isValidEmail || loading) return;

    try {
      setLoading(true);

      console.log("PASSWORD RESET REQUEST");
      console.log("Email:", email);

      const response = await authApi.requestPasswordReset(
        email.trim().toLowerCase()
      );

      console.log("PASSWORD RESET RESPONSE:", response);

      router.push({
        pathname: "/(auth)/verifyOtp",
        params: {
          email: email.trim().toLowerCase(),
          flow: "reset-password",
        },
      });
    } catch (error: any) {
      console.error(
        "PASSWORD RESET FAILED:",
        error?.response?.data || error
      );
      const feedback = getNetworkModalCopy(error, "Failed to send reset code. Please try again.");
      setErrorTitle(feedback.title);
      setErrorMessage(feedback.message);
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
          disabled={!isValidEmail || loading}
          onPress={handleSendCode}
          style={{ width: "100%", marginTop: 20 }}
        />
      </YStack>

      <SuccessModal
        visible={errorVisible}
        onClose={() => setErrorVisible(false)}
        title={errorTitle}
        message={errorMessage}
        type="warning"
      />
    </KeyboardAvoidingWrapper>
  );
}