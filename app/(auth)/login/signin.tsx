import { KeyboardAvoidingWrapper } from "@/components/layout/KeyboardAvoidingWrapper";
import Header from "@/components/layout/header";
import { TextInputWithIcon } from "@/components/ui/TextInputWithIcon";
import { SimpleButton } from "@/components/ui/centerTextButton";
import colors from "@/constants/colors";
import { useResponsive } from "@/hooks/useResponsive";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable } from "react-native";
import { Image, Text, XStack, YStack } from "tamagui";
import { EyeClosed, Eye } from "@tamagui/lucide-icons";

import { useAsyncStore } from "@/store/useAsyncStore";
import { useAuthStore } from "@/store/useAuthStore";
import { authApi } from "@/services/api/authApi";
import { isLoginPasswordValid } from "@/utils/passwordRules";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignIn() {
  const { wp, hp, fs } = useResponsive();

  const setAuth = useAuthStore((s) => s.setAuth);

  const start = useAsyncStore((s) => s.start);
  const stop = useAsyncStore((s) => s.stop);
  const isLoading = useAsyncStore((s) => s.isLoading("signin"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isFocusEmail, setIsFocusEmail] = useState(false);
  const [isFocusPassword, setIsFocusPassword] = useState(false);

  const [show, setShow] = useState(false);

  const [authError, setAuthError] = useState<string | null>(null);
  const [passwordClientError, setPasswordClientError] = useState<string | null>(null);

  const isValidEmail = emailRegex.test(email);
  const passwordIsValid = isLoginPasswordValid(password);

  const mailIcon = require("@/assets/images/mailWithBoder.png");
  const Xspecial = require("@/assets/images/closeSquare.png");

  const visualValidEmail: boolean | undefined =
    !isFocusEmail ? undefined : isValidEmail ? true : false;

  const visualValidPassword: boolean | undefined =
    !isFocusPassword ? undefined : passwordIsValid ? true : false;

  const handleNext = async () => {
    if (!isValidEmail || !passwordIsValid || isLoading) return;

    try {
      start("signin");

      setAuthError(null);
      setPasswordClientError(null);

      const response = await authApi.signIn({
        email: email.trim().toLowerCase(),
        password,
      });

      if (response.requiresOtp) {
        router.push({
          pathname: "/(auth)/otp",
          params: { email: email.trim().toLowerCase() },
        });
        return;
      }

      if (response.user && response.tokens) {
        setAuth(response.user, response.tokens);
        router.replace("/(tabs)/feed");
      }
    } catch {
      setAuthError("Email or password incorrect");
    } finally {
      stop("signin");
    }
  };

  const handlePasswordBlur = () => {
    setIsFocusPassword(false);

    if (password.length > 0 && !passwordIsValid) {
      setPasswordClientError("Enter a valid password");
    } else {
      setPasswordClientError(null);
    }
  };

  return (
    <KeyboardAvoidingWrapper>
      <XStack padding={15}><Header /></XStack>
      

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
        />

        <YStack alignItems="center" marginTop={hp(3)} gap={hp(1.5)}>
          <Text fontSize={fs(22)} fontWeight="600" textAlign="center">
            Sign in
          </Text>
        </YStack>

        {/* EMAIL */}

        <YStack width="100%" gap={hp(1)}>
          <TextInputWithIcon
            value={email}
            placeholder="Email address"
            headingText="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            isFocused={isFocusEmail}
            onFocus={() => setIsFocusEmail(true)}
            onBlur={() => setIsFocusEmail(false)}
            onChangeText={(text) => {
              setEmail(text);
              setAuthError(null);
            }}
            endIconVisible={isFocusEmail}
            isValid={visualValidEmail}
            endIcon={<Image source={Xspecial} width={wp(5)} height={wp(5)} />}
            onEndIconPress={() => {
              setEmail("");
              setAuthError(null);
            }}
          />
        </YStack>

        {/* PASSWORD */}

        <YStack width="100%" gap={hp(1)}>
          <TextInputWithIcon
            value={password}
            placeholder="Enter password"
            headingText="Password"
            secureTextEntry={!show}
            isFocused={isFocusPassword}
            isValid={visualValidPassword}
            onFocus={() => setIsFocusPassword(true)}
            onBlur={handlePasswordBlur}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordClientError(null);
              setAuthError(null);
            }}
            endIconVisible={password.length > 0 && isFocusPassword}
            endIcon={
              show ? (
                <Eye size={wp(5)} color={colors.inputIconColor} />
              ) : (
                <EyeClosed size={wp(5)} color={colors.inputIconColor} />
              )
            }
            onEndIconPress={() => setShow((prev) => !prev)}
          />

          {passwordClientError && (
            <Text
              fontSize={fs(13)}
              color={colors.errorText}
              alignSelf="flex-start"
              marginTop={hp(0.5)}
            >
              {passwordClientError}
            </Text>
          )}

          <Pressable onPress={() => router.push("/(auth)/forgotPassword")}>
            <Text
              fontSize={fs(13)}
              color={colors.forgotPassword}
              alignSelf="flex-end"
              marginTop={hp(0.5)}
            >
              Forgot password?
            </Text>
          </Pressable>
        </YStack>

        {/* AUTH ERROR */}

        {authError && (
          <Text
            fontSize={fs(13)}
            color={colors.errorText}
            alignSelf="flex-start"
            marginTop={hp(1)}
          >
            {authError}
          </Text>
        )}

        <SimpleButton
          text="Next"
          textColor={colors.buttonText}
          color={colors.primaryButton}
          disabled={!isValidEmail || !passwordIsValid || isLoading}
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