import { KeyboardAvoidingWrapper } from "@/components/layout/KeyboardAvoidingWrapper";
import Header from "@/components/layout/header";
import { TextInputWithIcon } from "@/components/ui/TextInputWithIcon";
import { SimpleButton } from "@/components/ui/centerTextButton";
import colors from "@/constants/colors";
import { useResponsive } from "@/hooks/useResponsive";
import { authApi } from "@/services/api/authApi";
import { useAsyncStore } from "@/store/useAsyncStore";
import { useSignupStore } from "@/store/useSignupStore";
import { router } from "expo-router";
import { useState } from "react";
import { Image, Text, XStack, YStack } from "tamagui";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Email() {
  const { wp, hp, fs } = useResponsive();

  const storedEmail = useSignupStore((s) => s.email);
  const setEmail = useSignupStore((s) => s.setEmail);

  const start = useAsyncStore((s) => s.start);
  const stop = useAsyncStore((s) => s.stop);
  const isLoading = useAsyncStore((s) => s.isLoading("emailNext"));

  const [email, setLocalEmail] = useState(storedEmail ?? "");
  const [isFocus, setIsFocus] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const isValidEmail = emailRegex.test(email);

  const Xspecial = require("@/assets/images/closeSquare.png");
  const mailIcon = require("@/assets/images/mailWithBoder.png");

  const showInvalidFormat = isFocus && email.length > 0 && !isValidEmail;

  const showError = showInvalidFormat || serverError;

  const visualValidity: boolean | undefined =
    !isFocus && !serverError ? undefined : showError ? false : true;

  const handleNext = async () => {
    if (!isValidEmail || isLoading) return;

    try {
      start("emailNext");

      setServerError(null);

      const result = await authApi.checkEmail(email.trim().toLowerCase());

      if (result.exists) {
        setServerError(result.message || "Email already registered");
        return;
      }

      setEmail(email.trim().toLowerCase());

      requestAnimationFrame(() => {
        setTimeout(() => {
          router.push("/(auth)/birthday");
        }, 120);
      });
    } catch (err: any) {
      setServerError(
        err?.response?.data?.error?.message ||
          "Unable to verify email, please try again",
      );
    } finally {
      stop("emailNext");
    }
  };

  return (
    <KeyboardAvoidingWrapper>
      <XStack paddingLeft={wp(5)}>
        <Header />
      </XStack>

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
            }}
            endIconVisible={isFocus}
            isValid={visualValidity}
            endIcon={<Image source={Xspecial} width={wp(5)} height={wp(5)} />}
            onEndIconPress={() => {
              setLocalEmail("");
              setServerError(null);
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
          disabled={!isValidEmail || isLoading}
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
