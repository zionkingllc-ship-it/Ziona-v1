import OtpContainer from "@/components/auth/OtpContainer";
import { KeyboardAvoidingWrapper } from "@/components/layout/KeyboardAvoidingWrapper";
import Header from "@/components/layout/header";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import SuccessModal from "@/components/ui/modals/successModal";
import { useNavigation, useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { Text, YStack, XStack, Image } from "tamagui";
import colors from "@/constants/colors";
import { graphqlRequest } from "@/services/graphQL/graphqlClient";
import { getNetworkModalCopy } from "@/utils/network/getNetworkModalCopy";

const OTP_LENGTH = 6;

export default function ChangePasswordOtp() {
  const navigation = useNavigation();
  const router = useRouter();

  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorTitle, setErrorTitle] = useState("Invalid code");
  const [errorMessage, setErrorMessage] = useState("Please check the code and try again");
  const [timer, setTimer] = useState(50);
  const [resendDisabled, setResendDisabled] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = (seconds: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimer(seconds);
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    startTimer(50);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleChange = (value: string[]) => {
    setOtpDigits(value);
  };

  const submitOtp = async (code: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await graphqlRequest(
        // GraphQL mutation for verify OTP with purpose change_password
        `mutation VerifyOtp($email: String!, $code: String!, $purpose: String!) {
          verifyOtp(email: $email, code: $code, purpose: $purpose) {
            success
            message
            errorCode
          }
        }`,
        { email: "user@example.com", code, purpose: "change_password" }
      );

      // TODO: Handle response based on backend contract
      // On success, navigate to ChangePassword screen
      router.push("/settings/ChangePassword");
      setIsSubmitting(false);
    } catch (error: any) {
      console.error("OTP verification failed:", error);

      const feedback = getNetworkModalCopy(
        error,
        error?.message || "Please check the code and try again"
      );
      setErrorTitle(feedback.title || "Invalid code");
      setErrorMessage(feedback.message || "Please check the code and try again");
      setErrorVisible(true);
      setIsSubmitting(false);
    }
  };

  const resendCode = async () => {
    startTimer(50);

    try {
      await graphqlRequest(
        `mutation SendOtp($email: String!, $purpose: String!) {
          sendOtp(email: $email, purpose: $purpose) {
            success
            message
            expiresIn
            resendAfter
          }
        }`,
        { email: "user@example.com", purpose: "change_password" }
      );
    } catch (error: any) {
      console.error("Resend OTP failed:", error);
      const feedback = getNetworkModalCopy(
        error,
        error?.message || "Failed to resend code"
      );
      setErrorTitle(feedback.title || "Failed to resend");
      setErrorMessage(feedback.message || "Please try again later");
      setErrorVisible(true);
    } finally {
      setIsResending(false);
      startTimer(50);
    }
  };

  return (
    <KeyboardAvoidingWrapper>
      <Header />
      <YStack flex={1} padding="$4" gap="$4" marginTop="$10">
        <Image
          source={require("@/assets/images/messageIcon.png")}
          width="$7"
          height="$7"
          borderRadius="$6"
          alignSelf="center"
        />

        <YStack alignItems="center" gap="$2.5">
          <Text fontFamily="$body" fontSize="$4" fontWeight="600">
            Enter your OTP
          </Text>

          <Text
            fontFamily="$body"
            fontSize="$3"
            color={colors.subHeader}
            textAlign="center"
          >
            Please enter the 6-digit code sent to
          </Text>

          <Text
            fontFamily="$body"
            fontWeight="600"
            color={colors.black}
          >
            user@example.com
          </Text>
        </YStack>

        <OtpContainer
          length={OTP_LENGTH}
          value={otpDigits}
          onChange={handleChange}
        />

        <YStack alignItems="center" marginTop="$6">
          <Text fontSize={16} fontFamily="$body" color={colors.subHeader}>
            Didn't receive a code?
          </Text>
          {timer > 0 ? (
            <Text
              fontSize={16}
              fontFamily="$body"
              color={colors.headerText}
              textDecorationLine="underline"
            >
              You can request a new code in 0:
              {timer.toString().padStart(2, "0")}s
            </Text>
          ) : (
            <Text
              onPress={() => alert("Resend clicked")}
              style={{ marginTop: 10 }}
              fontFamily="$body"
              fontSize={16}
              color={colors.black}
              textDecorationLine="underline"
            >
              {isResending ? "Resending..." : "Resend code"}
            </Text>
          )}
        </YStack>

        <PrimaryButton
          onPress={() => {
            if (otpDigits.every((digit) => digit !== "")) {
              submitOtp("123456");
            }
          }}
          disabled={!otpDigits.every((digit) => digit !== "") || isSubmitting}
          loading={isSubmitting}
          style={{ marginTop: 8 }}
          text="Submit OTP"
          textColor={colors.white}
          color={colors.primary}
        />
      </YStack>

      {/* ERROR MODAL */}
      <SuccessModal
        visible={errorVisible}
        type="failed"
        autoClose
        duration={3000}
        onClose={() => setErrorVisible(false)}
        title={errorTitle}
        message={errorMessage}
      />
    </KeyboardAvoidingWrapper>
  );
}