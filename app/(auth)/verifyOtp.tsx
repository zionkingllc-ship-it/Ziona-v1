import OtpContainer from "@/components/auth/OtpContainer";
import { KeyboardAvoidingWrapper } from "@/components/layout/KeyboardAvoidingWrapper";
import Header from "@/components/layout/header";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import SuccessModal from "@/components/ui/modals/successModal";
import colors from "@/constants/colors";
import { authApi } from "@/services/api/authApi";
import { useAuthStore } from "@/store/useAuthStore";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Keyboard } from "react-native";
import { Image, Text, YStack, XStack } from "tamagui";

const OTP_LENGTH = 6;

/* ---------------- DEBUG HELPERS ---------------- */

const log = (...args: any[]) => {
  console.log("OTP FLOW:", ...args);
};

const line = () => {
  console.log("--------------------------------------------------");
};

export default function VerifyOtp() {
  const { email, flow } = useLocalSearchParams<{
    email: string;
    flow: "signup" | "signin" | "reset-password";
  }>();

  const setAuth = useAuthStore((s) => s.setAuth);

  const [timer, setTimer] = useState(50);
  const [errorVisible, setErrorVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------------- SCREEN MOUNT ---------------- */

  useEffect(() => {
    line();
    log("OTP screen mounted");
    log("Flow:", flow);
    log("Email:", email);
    line();
  }, []);

  /* ---------------- TIMER ---------------- */

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          log("Resend available");
          return 0;
        }

        const next = prev - 1;
        log("Timer:", next);
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /* ---------------- SUBMIT OTP ---------------- */

  const submitOtp = async (code: string) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    Keyboard.dismiss();

    line();
    log("Submitting OTP");
    log("Code:", code);
    log("Email:", email);
    log("Flow:", flow);
    line();

    try {
      /* ---------------- SIGNUP / SIGNIN VERIFY ---------------- */

      if (flow === "signup" || flow === "signin") {
        const response = await authApi.verifyOtp({
          email,
          code,
        });

        log("OTP verification success");
        log("Backend response:", response);

        if (response.user && response.tokens) {
          log("Saving auth tokens");
          setAuth(response.user, response.tokens);
        }

        log("Routing to feed");
        router.replace("/(tabs)/feed");
        return;
      }

      /* ---------------- PASSWORD RESET ---------------- */

      if (flow === "reset-password") {
        log("OTP verified for password reset");

        router.replace({
          pathname: "/(auth)/forgotPassword/newPassword",
          params: {
            email,
            otp: code,
          },
        });

        return;
      }
    } catch (error: any) {
      console.error("OTP verification failed:", error?.response?.data || error);

      setErrorVisible(true);
      setIsSubmitting(false);
    }
  };

  /* ---------------- RESEND OTP ---------------- */

  const resendCode = async () => {
    if (!email) return;

    line();
    log("Resend OTP requested");
    log("Email:", email);

    setTimer(50);

    try {
      const response = await authApi.resendOtp(email);

      log("Resend success:", response);
    } catch (error: any) {
      console.error("Resend OTP failed:", error?.response?.data || error);

      setErrorVisible(true);
    }

    line();
  };

  /* ---------------- RENDER ---------------- */

  return (
    <KeyboardAvoidingWrapper>
      <XStack padding={15}><Header /></XStack>
      

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
              onPress={() => router.back()}
            >
              Edit
            </Text>
          </Text>
        </YStack>

        {/* OTP INPUTS */}

        <OtpContainer
          length={OTP_LENGTH}
          onComplete={(code: string) => {
            log("OTP complete — triggering submit");
            submitOtp(code);
          }}
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
            <PrimaryButton
              onPress={resendCode}
              style={{ marginTop: 10 }}
              text="Resend code"
              textColor={colors.white}
              color={colors.primary}
            />
          )}
        </YStack>
      </YStack>

      {/* ERROR MODAL */}

      <SuccessModal
        visible={errorVisible}
        type="failed"
        autoClose
        duration={3000}
        onClose={() => setErrorVisible(false)}
        title="Incorrect code entered"
        message="Please check the code and try again"
      />
    </KeyboardAvoidingWrapper>
  );
}
