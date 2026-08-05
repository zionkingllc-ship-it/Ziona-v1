import { KeyboardAvoidingWrapper } from "@/components/layout/KeyboardAvoidingWrapper";
import Header from "@/components/layout/header";
import { TextInputWithIcon } from "@/components/ui/TextInputWithIcon";
import { SimpleButton } from "@/components/ui/centerTextButton";
import colors from "@/constants/colors";
import { useResponsive } from "@/hooks/useResponsive";
import { authApi } from "@/services/api/authApi";
import { useAsyncStore } from "@/store/useAsyncStore";
import { useSignupStore } from "@/store/useSignupStore";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Image, Text, XStack, YStack } from "tamagui";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Email() {
  const { wp, hp, fs } = useResponsive();
  const { edit } = useLocalSearchParams<{ edit?: string }>();

  const storedEmail = useSignupStore((s) => s.email);
  const birthday = useSignupStore((s) => s.birthday);
  const password = useSignupStore((s) => s.password);
  const selectedUsername = useSignupStore((s) => s.selectedUsername);
  const setEmail = useSignupStore((s) => s.setEmail);
  const setFlow = useSignupStore((s) => s.setFlow);

  const start = useAsyncStore((s) => s.start);
  const stop = useAsyncStore((s) => s.stop);
  const isLoading = useAsyncStore((s) => s.isLoading("emailNext"));

  const [email, setLocalEmail] = useState(storedEmail ?? "");
  const [isFocus, setIsFocus] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isValidEmail = emailRegex.test(email);

  const Xspecial = require("@/assets/images/closeSquare.png");
  const mailIcon = require("@/assets/images/mailWithBoder.png");

  const showError = (submitted && !isValidEmail) || serverError;

  const visualValidity: boolean | undefined =
    submitted && !serverError ? (!isValidEmail ? false : true) : undefined;

  const handleNext = async () => {
    if (isLoading) return;

    if (!isValidEmail) {
      setSubmitted(true);
      return;
    }

    setSubmitted(false);

    try {
      start("emailNext");

      setServerError(null);

      const trimmedEmail = email.trim().toLowerCase();

      const result = await authApi.checkEmail(trimmedEmail);

      if (result.exists && edit !== "1") {
        setServerError(result.message || "Email already registered");
        stop("emailNext");
        return;
      }

      setEmail(trimmedEmail);
      setFlow("email");

      // Editing from OTP: signup data already exists, re-submit signup and
      // return straight to OTP without repeating birthday/password/username.
      if (edit === "1" && birthday && password && selectedUsername) {
        await authApi.signUp({
          email: trimmedEmail,
          birthday,
          username: selectedUsername,
          password,
        });

        requestAnimationFrame(() => {
          setTimeout(() => {
            router.replace({
              pathname: "/(auth)/verifyOtp",
              params: { email: trimmedEmail, flow: "signup" },
            });
            stop("emailNext");
          }, 120);
        });
        return;
      }

      requestAnimationFrame(() => {
        setTimeout(() => {
          router.push("/(auth)/birthday");
          stop("emailNext");
        }, 120);
      });
    } catch (err: any) {
      console.error("🟥 EMAIL ERROR:", err?.response?.data || err?.message || err);
      setServerError(
        err?.error?.message || err?.message ||
          "Unable to verify email, please try again",
      );
      stop("emailNext");
    }
  };

  return (
    <KeyboardAvoidingWrapper>
      <Header />

      <YStack
        flex={1}
        paddingHorizontal={wp(6)}
        gap={hp(2)}
        alignItems="center"
        marginTop={hp(8)}
        width="100%"
      >
        <Image
          source={mailIcon}
          width={wp(18)}
          height={wp(18)}
          borderRadius={wp(2)}
          alignSelf="center"
        />

        <YStack alignItems="center" marginTop={hp(3)} gap={hp(1.5)}>
          <Text fontSize={fs(22)} fontWeight="600" textAlign="center">
            Your email address
          </Text>
        </YStack>

        <YStack width="100%" gap={hp(1)}>
          <TextInputWithIcon
            value={email}
            placeholder="Email address"
            headingText="Email address"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            isFocused={isFocus}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChangeText={(text) => {
              setLocalEmail(text);
              setServerError(null);
              setSubmitted(false);
            }}
            endIconVisible={isFocus}
            isValid={visualValidity}
            endIcon={<Image source={Xspecial} width={wp(5)} height={wp(5)} />}
            onEndIconPress={() => {
              setLocalEmail("");
              setServerError(null);
              setSubmitted(false);
            }}
          />

          {showError && (
            <Text
              fontSize={fs(13)}
              color={colors.errorText}
              alignSelf="flex-start"
              marginTop={hp(0.5)}
            >
              {serverError || "Enter a valid email address"}
            </Text>
          )}
        </YStack>

        <SimpleButton
          text="Next"
          textColor={colors.buttonText}
          color={colors.primaryButton}
          disabled={isLoading}
          loading={isLoading}
          onPress={handleNext}
          style={{
            width: "100%",
            marginTop: hp(3),
            height: hp(6.5),
          }}
          textSize={fs(16)}
        />
      </YStack>
    </KeyboardAvoidingWrapper>
  );
}
