import OtpContainer from "@/components/auth/OtpContainer";
import { KeyboardAvoidingWrapper } from "@/components/layout/KeyboardAvoidingWrapper";
import Header from "@/components/layout/header";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import SuccessModal from "@/components/ui/modals/successModal";
import colors from "@/constants/colors";
import { authApi } from "@/services/api/authApi";
import { useAuthStore } from "@/store/useAuthStore";
import { getNetworkModalCopy } from "@/utils/network/getNetworkModalCopy";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Keyboard } from "react-native";
import { Image, Text, YStack, XStack } from "tamagui";
import { AppError, getErrorMessage } from "@/utils/error";

const OTP_LENGTH = 6;

export default function VerifyOtp() {
  const { email, flow } = useLocalSearchParams<{
    email: string;
    flow: "signup" | "signin" | "reset-password";
  }>();

  const setAuth = useAuthStore((s) => s.setAuth);

  const [timer, setTimer] = useState(50);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorTitle, setErrorTitle] = useState("Incorrect code entered");
  const [errorMessage, setErrorMessage] = useState("Please check the code and try again");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));

  /* ---------------- TIMER ---------------- */

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

  /* ---------------- SUBMIT OTP ---------------- */

  const submitOtp = async (code: string) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    Keyboard.dismiss();

    try {
      /* ---------------- SIGNUP / SIGNIN VERIFY ---------------- */

      if (flow === "signup" || flow === "signin") {
        const response = await authApi.verifyOtp({
          email,
          code,
        });

        if (!response.user || !response.tokens) {
          throw new Error("Invalid response from server");
        }

        setAuth(response.user, response.tokens);
        router.replace("/(tabs)/feed");
        setIsSubmitting(false);
        return;
      }

      /* ---------------- PASSWORD RESET ---------------- */

      if (flow === "reset-password") {
        router.replace({
          pathname: "/(auth)/forgotPassword/newPassword",
          params: {
            email,
            otp: code,
          },
        });

        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
    } catch (error: any) {
      console.error("OTP verification failed:", error);

      setErrorTitle(getErrorMessage(error));
      setErrorMessage(getErrorMessage(error));
      setErrorVisible(true);
      setIsSubmitting(false);
    }
  };

  /* ---------------- RESEND OTP ---------------- */

  const resendCode = async () => {
    if (!email || isResending) return;

    setErrorVisible(false);
    setIsResending(true);
    startTimer(50);

    try {
      await authApi.resendOtp(email);
    } catch (error: any) {
      console.error("Resend OTP failed:", error);

      setErrorTitle(getErrorMessage(error));
      setErrorMessage(getErrorMessage(error));
      setErrorVisible(true);
    } finally {
      setIsResending(false);
    }
  };

  /* ---------------- RENDER ---------------- */

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
            Please enter the 6-digit code sent to{"\n"}
            <Text fontFamily="$body" fontWeight="600" color={colors.black}>
              {email}
            </Text>{" "}
            <Text
              fontFamily="$body"
              color={colors.primary}
              onPress={() => {
                if (flow === "signup") {
                  // Email signup stack is: email → birthday → password → username → verifyOtp.
                  // router.back() would land on username — jump straight back to the email entry screen.
                  // Passing `edit=1` keeps signup data and lets the user skip ahead to OTP again.
                  router.replace({
                    pathname: "/(auth)/email",
                    params: { edit: "1" },
                  });
                } else {
                  // signin / reset-password: verifyOtp is pushed directly from the
                  // email entry screen, so back returns there correctly.
                  router.back();
                }
              }}
            >
              Edit
            </Text>
          </Text>
        </YStack>

        {/* OTP INPUTS */}

        <OtpContainer
          length={OTP_LENGTH}
          value={otpDigits}
          onChange={setOtpDigits}
        />

        {/* RESEND */}

        <YStack alignItems="center" marginTop="$6">
          <Text fontSize={16} fontFamily="$body" color={colors.subHeader}>
            Didn’t receive a code?
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
              onPress={resendCode}
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

        {/* SUBMIT */}

        <PrimaryButton
          onPress={() => {
            if (otpDigits.every((digit) => digit !== "")) {
              submitOtp(otpDigits.join(""));
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
