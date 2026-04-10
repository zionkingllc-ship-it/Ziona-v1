import Header from "@/components/layout/header";
import { KeyboardAvoidingWrapper } from "@/components/layout/KeyboardAvoidingWrapper";
import { SimpleButton } from "@/components/ui/centerTextButton";
import { TextInputWithIcon } from "@/components/ui/TextInputWithIcon";
import colors from "@/constants/colors";
import { useResponsive } from "@/hooks/useResponsive";
import { useSignupStore } from "@/store/useSignupStore";
import { isPasswordValid, passwordRules } from "@/utils/passwordRules";
import { Eye, EyeClosed } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Image, Text, YStack } from "tamagui";

export default function CreatePassword() {
  const { wp, hp, fs } = useResponsive();

  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [isFocus, setIsFocus] = useState(false);

  const setPasswordStore = useSignupStore((s) => s.setPassword);

  const checks = {
    length: passwordRules.minLength(password),
    letterNumber: passwordRules.hasLetterAndNumber(password),
    special: passwordRules.hasSpecialChar(password),
  };

  const passwordIsValid = isPasswordValid(password);

  const showInvalid = isFocus && password.length > 0 && !passwordIsValid;

  const visualValidity: boolean | undefined =
    !isFocus ? undefined : showInvalid ? false : true;

  const handleNext = () => {
    if (!passwordIsValid) return;

    setPasswordStore(password);

    requestAnimationFrame(() => {
      setTimeout(() => {
        router.push("/(auth)/username");
      }, 120);
    });
  };

  const lockIcon = require("@/assets/images/lockIcon.png");

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
          source={lockIcon}
          width={wp(18)}
          height={wp(18)}
          borderRadius={wp(9)}
          alignSelf="center"
        />

        <YStack alignItems="center" marginTop={hp(3)} gap={hp(1.5)}>
          <Text fontSize={fs(22)} fontWeight="600" textAlign="center">
            Create password
          </Text>
        </YStack>

        {/* PASSWORD INPUT */}

        <YStack width="100%" gap={hp(1)}>
          <TextInputWithIcon
            value={password}
            placeholder="Enter password"
            headingText="Password"
            secureTextEntry={!show}
            isFocused={isFocus}
            isValid={visualValidity}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChangeText={setPassword}
            endIconVisible={password.length > 0 && isFocus}
            endIcon={
              show ? (
                <Eye size={wp(5)} color={colors.inputIconColor} />
              ) : (
                <EyeClosed size={wp(5)} color={colors.inputIconColor} />
              )
            }
            onEndIconPress={() => setShow((prev) => !prev)}
          />
        </YStack>

        {/* PASSWORD RULES */}

        <YStack width="100%" gap={hp(0.8)} marginTop={hp(1)}>
          <Rule ok={checks.length} text="8 characters (20 max)" fs={fs} />
          <Rule ok={checks.letterNumber} text="1 letter and 1 number" fs={fs} />
          <Rule
            ok={checks.special}
            text="1 special character (e.g. ! @ &)"
            fs={fs}
          />
        </YStack>

        <SimpleButton
          text="Next"
          textColor={colors.white}
          color={colors.primary}
          disabled={!passwordIsValid}
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

function Rule({
  ok,
  text,
  fs,
}: {
  ok: boolean;
  text: string;
  fs: (size: number) => number;
}) {
  return (
    <Text fontSize={fs(14)} color={ok ? colors.SUCCESS_GREEN : colors.subHeader}>
      ✓ {text}
    </Text>
  );
}