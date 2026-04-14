import Header from "@/components/layout/header";
import { KeyboardAvoidingWrapper } from "@/components/layout/KeyboardAvoidingWrapper";
import { SimpleButton } from "@/components/ui/centerTextButton";
import SuccessModal from "@/components/ui/modals/successModal";
import { TextInputWithIcon } from "@/components/ui/TextInputWithIcon";
import colors from "@/constants/colors";
import { useChangePassword } from "@/hooks/useAccountSettings";
import { getNetworkModalCopy } from "@/utils/network/getNetworkModalCopy";
import { Eye, EyeClosed } from "@tamagui/lucide-icons";
import { useState } from "react";
import { Text, XStack, YStack, View } from "tamagui";


export default function ChangePasswordScreen() {
  const changePassword = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorModalTitle, setErrorModalTitle] = useState("");
  const [errorModalMessage, setErrorModalMessage] = useState("");

  const [modalVisible, setModalVisible] = useState(false);

  const isValid =
    newPassword.length >= 8 &&
    newPassword === confirmPassword &&
    currentPassword.length > 0;

  const handleSubmit = async () => {
    if (!isValid || changePassword.isPending) return;

    try {
      await changePassword.mutateAsync({
        currentPassword,
        newPassword,
      });

      setModalVisible(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      const feedback = getNetworkModalCopy(e, e?.message || "Failed to change password");
      setErrorModalTitle(feedback.title);
      setErrorModalMessage(feedback.message);
      setErrorModalVisible(true);
    }
  };

  return (
    <KeyboardAvoidingWrapper>
      <Header heading="Change password" />

      <YStack padding="$4" gap="$4" marginTop="$4">

        {/* CURRENT PASSWORD */}
        <TextInputWithIcon
          value={currentPassword}
          placeholder="Enter current password"
          headingText="Current Password"
          secureTextEntry={!showCurrent}
          isValid={error ? false : undefined}
          onChangeText={(t) => {
            setCurrentPassword(t);
            setError("");
          }}
          endIcon={
            showCurrent ? (
              <Eye size={20} />
            ) : (
              <EyeClosed size={20} />
            )
          }
          endIconVisible={currentPassword.length > 0}
          onEndIconPress={() => setShowCurrent((p) => !p)}
        />

        {error ? (
          <Text fontFamily="$body" color={colors.DEBIT_RED} fontSize={12}>
            {error}
          </Text>
        ) : null}

        {/* NEW PASSWORD */}
        <TextInputWithIcon
          value={newPassword}
          placeholder="Enter new password"
          headingText="New Password"
          secureTextEntry={!showNew}
          onChangeText={setNewPassword}
          endIcon={
            showNew ? <Eye size={20} /> : <EyeClosed size={20} />
          }
          endIconVisible={newPassword.length > 0}
          onEndIconPress={() => setShowNew((p) => !p)}
        />

        {/* CONFIRM PASSWORD */}
        <TextInputWithIcon
          value={confirmPassword}
          placeholder="Retype new password"
          headingText="Retype new password"
          secureTextEntry={!showConfirm}
          onChangeText={setConfirmPassword}
          endIcon={
            showConfirm ? <Eye size={20} /> : <EyeClosed size={20} />
          }
          endIconVisible={confirmPassword.length > 0}
          onEndIconPress={() => setShowConfirm((p) => !p)}
        />

        {/* FORGOT PASSWORD */}
        <Text fontFamily="$body" fontSize={13} color={colors.primary}>
          Forgot password?
        </Text>

        {/* RULES */}
        <YStack gap="$2" marginTop="$2">
          <Text fontFamily="$body" fontWeight="500" color={colors.black}>Your password must have at least:</Text>

          <Rule ok={newPassword.length >= 8} text="8 characters (20 max)" />
          <Rule
            ok={/[A-Za-z]/.test(newPassword) && /\d/.test(newPassword)}
            text="1 letter and 1 number"
          />
          <Rule
            ok={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)}
            text="1 special character (Example: ?! @ &)"
          />
        </YStack>

        {/* SIGN OUT OPTION */}
        <XStack alignItems="center" gap="$2" marginTop="$3">
          <View
            width={18}
            height={18}
            borderRadius={4}
            backgroundColor={colors.SUCCESS_GREEN}
            justifyContent="center"
            alignItems="center"
          >
            <Text color={colors.white} fontSize={12}>✓</Text>
          </View>

          <Text fontFamily="$body" fontSize={13} color={colors.secondaryGray}>
            Sign out of other devices if you suspect unauthorized access.
          </Text>
        </XStack>

        {/* BUTTON */}
        <SimpleButton
          text="Change password"
          loading={changePassword.isPending}
          disabled={!isValid}
          color={isValid ? colors.primary : colors.inactiveButton}
          textColor={colors.white}
          onPress={handleSubmit}
        />
      </YStack>

      {/* SUCCESS MODAL */}
      <SuccessModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Password updated"
        message="Your password has been changed successfully."
        type="success"
      />

      {/* ERROR MODAL */}
      <SuccessModal
        visible={errorModalVisible}
        onClose={() => setErrorModalVisible(false)}
        title={errorModalTitle}
        message={errorModalMessage}
        type="warning"
      />
    </KeyboardAvoidingWrapper>
  );
}

/* RULE COMPONENT */
function Rule({ ok, text }: { ok: boolean; text: string }) {
  return (
    <Text fontFamily="$body" color={ok ? colors.SUCCESS_GREEN : colors.gray} fontSize={13}>
      ✓ {text}
    </Text>
  );
}