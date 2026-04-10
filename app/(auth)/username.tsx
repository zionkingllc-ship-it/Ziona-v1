import Header from "@/components/layout/header";
import { KeyboardAvoidingWrapper } from "@/components/layout/KeyboardAvoidingWrapper";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextInputWithIcon } from "@/components/ui/TextInputWithIcon";
import colors from "@/constants/colors";
import { useResponsive } from "@/hooks/useResponsive";
import { useSignupStore } from "@/store/useSignupStore";
import { authApi } from "@/services/api/authApi";
import { useAsyncStore } from "@/store/useAsyncStore";
import { router } from "expo-router";
import { useState } from "react";
import { Image, Text, XStack, YStack } from "tamagui";
import { api } from "@/services/api/client";

export default function CreateUsername() {
  const { wp, hp, fs } = useResponsive();

  const suggestions = useSignupStore((s) => s.suggestedUsernames) ?? [];
  const setSelectedUsername = useSignupStore((s) => s.setSelectedUsername);

  const email = useSignupStore((s) => s.email);
  const birthday = useSignupStore((s) => s.birthday);
  const password = useSignupStore((s) => s.password);

  const start = useAsyncStore((s) => s.start);
  const stop = useAsyncStore((s) => s.stop);
  const isLoading = useAsyncStore((s) => s.isLoading("signup"));

  const [username, setUsername] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [isFocus, setIsFocus] = useState(false);

  const userIcon = require("@/assets/images/userIcon.png");
 
  const isValidUsername = username.trim().length > 0;

  const visualValidity: boolean | undefined =
    !isFocus ? undefined : isValidUsername ? true : false;

const flow = useSignupStore((s) => s.flow);

const handleSubmit = async () => {
  if (!isValidUsername) return;

  const cleanUsername = username.trim().toLowerCase();

  setSelectedUsername(cleanUsername);

  try {
    start("signup");

    if (flow === "email") {
      if (!email || !birthday || !password) return;

      await authApi.signUp({
        email,
        birthday,
        username: cleanUsername,
        password,
      });

      router.push({
        pathname: "/(auth)/verifyOtp",
        params: { email, flow: "signup" },
      });
    }

    if (flow === "google") {
      await api.post("/user/finalize-username", {
        username: cleanUsername,
      });

      router.replace("/(tabs)/feed");
    }
  } catch (error) {
    console.error("Signup error:", error);
  } finally {
    stop("signup");
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
          source={userIcon}
          width={wp(18)}
          height={wp(18)}
          borderRadius={wp(9)}
          alignSelf="center"
        />

        <YStack alignItems="center" marginTop={hp(3)} gap={hp(1.5)}>
          <Text fontSize={fs(22)} fontWeight="600" textAlign="center">
            Create username
          </Text>

          <Text fontSize={fs(14)} color={colors.gray} textAlign="center">
            You can always change this later
          </Text>
        </YStack>

        {/* USERNAME INPUT */}

        <YStack width="100%" gap={hp(1)}>
          <TextInputWithIcon
            placeholder="Username"
            headingText="Username"
            value={username}
            isFocused={isFocus}
            isValid={visualValidity}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChangeText={(value) => {
              setUsername(value);
              setSelectedSuggestion(null);
            }}
          />
        </YStack>

        {/* USERNAME SUGGESTIONS */}

        {suggestions.length > 0 && (
          <YStack width="100%" gap={hp(1.5)}>
            <Text fontSize={fs(14)} color={colors.headerText}>
              Suggestions:
            </Text>

            <XStack gap={wp(2)} flexWrap="wrap">
              {suggestions.map((name) => {
                const isSelected = selectedSuggestion === name;

                return (
                  <Text
                    key={name}
                    paddingVertical={hp(0.8)}
                    paddingHorizontal={wp(3)}
                    fontSize={fs(13)}
                    backgroundColor={colors.suggestionBackground}
                    borderRadius={wp(2)}
                    borderWidth={isSelected ? 1 : 0}
                    borderColor={colors.borderColor}
                    onPress={() => {
                      setUsername(name);
                      setSelectedSuggestion(name);
                    }}
                  >
                    {name}
                  </Text>
                );
              })}
            </XStack>
          </YStack>
        )}

        {/* SIGNUP BUTTON */}

        <PrimaryButton
          text="Sign up"
          textColor={colors.white}
          color={colors.primary}
          disabled={!isValidUsername || isLoading}
          onPress={handleSubmit}
          style={{
            width: "100%",
            marginTop: hp(3),
            height: hp(6.5),
          }}
        />
      </YStack>
    </KeyboardAvoidingWrapper>
  );
}