import Header from "@/components/layout/header";
import { KeyboardAvoidingWrapper } from "@/components/layout/KeyboardAvoidingWrapper";
import { SimpleButton } from "@/components/ui/centerTextButton";
import SuccessModal from "@/components/ui/modals/successModal";
import { TextInputWithIcon } from "@/components/ui/TextInputWithIcon";
import colors from "@/constants/colors";
import { authApi } from "@/services/api/authApi";
import { isPasswordValid, passwordRules } from "@/utils/passwordRules";
import { getNetworkModalCopy } from "@/utils/network/getNetworkModalCopy";
import { Eye, EyeClosed } from "@tamagui/lucide-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Image, Text, YStack } from "tamagui";

export default function CreatePassword() {
  const { email, otp } = useLocalSearchParams<{
    email: string;
    otp: string;
  }>();

  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorTitle, setErrorTitle] = useState("Password reset failed");
  const [errorMessage, setErrorMessage] = useState("Your reset code may have expired. Please request a new code.");

  const checks = {
    length: passwordRules.minLength(password),
    letterNumber: passwordRules.hasLetterAndNumber(password),
    special: passwordRules.hasSpecialChar(password),
  };

  const passwordIsValid = isPasswordValid(password);

  const showInvalid = isFocus && password.length > 0 && !passwordIsValid;

  const visualValidity: boolean | undefined =
    !isFocus ? undefined : showInvalid ? false : true;

  const handleSubmit = async () => {
    if (!passwordIsValid || loading) return;
    if (!email || !otp) return;

    try {
      setLoading(true);

      console.log("RESET PASSWORD REQUEST");
      console.log("Email:", email);
      console.log("OTP:", otp);

      const response = await authApi.confirmPasswordReset({
        email,
        otp,
        newPassword: password,
      });

      console.log("🟢 PASSWORD RESET SUCCESS", response);

      router.replace("/(auth)/login/signin");
    } catch (error: any) {
      console.error("🔴 PASSWORD RESET FAILED", error?.response?.data || error);

      const feedback = getNetworkModalCopy(error, "Your reset code may have expired. Please request a new code.");
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

      <YStack flex={1} padding="$4" gap="$4" marginTop="$10" width="100%">
        <Image
          source={require("@/assets/images/lockIcon.png")}
          width="$7"
          height="$7"
          borderRadius="$6"
          alignSelf="center"
        />

        <YStack alignItems="center" marginTop="$6" gap="$3">
          <Text
            fontFamily="$body"
            fontSize="$4"
            fontWeight="600"
            color="#754800"
          >
            Create new password
          </Text>
        </YStack>

        {/* PASSWORD INPUT */}

        <TextInputWithIcon
          value={password}
          placeholder="Enter password"
          headingText="Password"
          secureTextEntry={!show}
          isFocused={isFocus}
          isValid={visualValidity}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChangeText={(text) => {
            setPassword(text);
          }}
          endIconVisible={password.length > 0 && isFocus}
          endIcon={
            show ? (
              <Eye size={24} color={colors.inputIconColor} />
            ) : (
              <EyeClosed size={24} color={colors.inputIconColor} />
            )
          }
          onEndIconPress={() => setShow((prev) => !prev)}
        />

        {/* PASSWORD RULES */}

        <YStack gap="$2" marginLeft={5}>
          <Text
            fontFamily="$body"
            fontSize="$4"
            fontWeight="500"
            color={colors.headerText}
          >
            Your password must have at least:
          </Text>

          <Rule ok={checks.length} text="8 characters (20 max)" />
          <Rule ok={checks.letterNumber} text="1 letter and 1 number" />
          <Rule ok={checks.special} text="1 special character (e.g. ! @ &)" />
        </YStack>

        <SimpleButton
          text="Next"
          loading={loading}
          textColor={colors.white}
          color={colors.primary}
          disabled={!passwordIsValid}
          onPress={handleSubmit}
        />
      </YStack>

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

function Rule({ ok, text }: { ok: boolean; text: string }) {
  return (
    <Text
      fontFamily="$body"
      fontSize="$4"
      color={ok ? colors.SUCCESS_GREEN : colors.subHeader}
    >
      ✓ {text}
    </Text>
  );
}