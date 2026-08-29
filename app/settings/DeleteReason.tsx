import Header from "@/components/layout/header";
import { SimpleButton } from "@/components/ui/centerTextButton";
import SuccessModal from "@/components/ui/modals/successModal";
import ErrorModal from "@/components/ui/modals/ErrorModal";
import colors from "@/constants/colors";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Modal, Pressable as RNPressable, TextInput as RNTextInput } from "react-native";
import { Text, XStack, YStack, TextArea } from "tamagui";
import { useRouter } from "expo-router";
import { useDeleteAccount } from "@/hooks/useAccountSettings";
import { AppError, getErrorMessage, isAuthError } from "@/utils/error";

type Reason =
  | "temporary"
  | "safety"
  | "trouble"
  | "other"
  | null;

export default function DeleteReasonScreen() {
  const router = useRouter();
  const deleteAccount = useDeleteAccount();
  const [selected, setSelected] = useState<Reason>(null);
  const [otherText, setOtherText] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const isValid =
    selected &&
    (selected !== "other" || otherText.trim().length > 0) &&
    acknowledged;

  const handleDelete = () => {
    if (!isValid) return;
    setPassword("");
    setPasswordError("");
    setPasswordVisible(true);
  };

  const confirmWithPassword = async () => {
    if (!password.trim()) {
      setPasswordError("Please enter your password");
      return;
    }

    setVerifying(true);
    setPasswordError("");

    deleteAccount.mutate(
      {
        reason: selected!,
        detail: selected === "other" ? otherText.trim() : undefined,
        acknowledgePermanentDeletion: acknowledged,
        password: password.trim(),
      },
      {
        onSuccess: () => setSuccessModalVisible(true),
        onError: (error: any) => {
          setPasswordVisible(false);
          setVerifying(false);
          if (isAuthError(error) || getErrorMessage(error).toLowerCase().includes("password") || error?.status === 401 || error?.status === 403) {
            setPasswordError("Incorrect password. Please try again.");
          } else {
            setErrorMessage(getErrorMessage(error) || "Failed to delete account. Please try again.");
            setErrorVisible(true);
          }
        },
        onSettled: () => {
          setVerifying(false);
        },
      },
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      
      {/* HEADER */}
      <Header
          heading=""
          headerFontFamily="$body"
          headingWeight="500"
        />

      <YStack flex={1} paddingHorizontal={16}>
        {/* TITLE */}
        <Text fontFamily="$body" fontSize={14} fontWeight="600" marginBottom={6} color={colors.black}>
          Before you go, we may be of help?
        </Text>

        <Text fontFamily="$body" fontSize={12} fontWeight="400" color={colors.gray} marginBottom={20}>
          We are so sorry to see you leave, before you go, please let us know why
          you are thinking of leaving, so we can help with common issues and
          improve our service
        </Text>

        {/* OPTIONS */}
        <Option label="It is a temporary decision" value="temporary" selected={selected} onSelect={setSelected} />
        
        {selected === "temporary" && (
          <YStack marginBottom={12} paddingLeft={26}>
            <Text fontFamily="$body" fontSize={12} fontWeight="400" color={colors.gray}>
              If you may return in the future, consider deactivating your account
              instead. Deactivation lets you restore your account at any time.
              Deleting your account will permanently remove your account and all
              content after 30 days.
            </Text>
            
            <RNPressable onPress={() => router.push("/settings/DeactivateAccount")}>
              <Text fontFamily="$body" fontSize={12} fontWeight="500" color={colors.primary} marginTop={6}>
                Deactivate account instead
              </Text>
            </RNPressable>
          </YStack>
        )}

        <Option label="Safety or privacy concerns" value="safety" selected={selected} onSelect={setSelected} />

        {selected === "safety" && (
          <YStack marginBottom={12} paddingLeft={26}>
            <Text fontFamily="$body" fontSize={12} fontWeight="500" color={colors.gray}>
              Try this instead:
            </Text>
            
            <Text fontFamily="$body" fontSize={12} fontWeight="500" color={colors.primary} marginTop={6}>
              Report a problem
            </Text>
            
            <Text fontFamily="$body" fontSize={12} fontWeight="500" color={colors.primary} marginTop={4}>
              Blocking users
            </Text>
            
            <Text fontFamily="$body" fontSize={12} fontWeight="500" color={colors.primary} marginTop={4}>
              Keeping your account secure
            </Text>
          </YStack>
        )}

        <Option label="Trouble getting started" value="trouble" selected={selected} onSelect={setSelected} />

        {selected === "trouble" && (
          <YStack marginBottom={12} paddingLeft={26}>
            <Text fontFamily="$body" fontSize={12} fontWeight="500" color={colors.gray}>
              Try this instead:
            </Text>

            <Text fontFamily="$body" fontSize={12} fontWeight="500" color={colors.primary} marginTop={6}>
              Report a problem
            </Text>

            <Text fontFamily="$body" fontSize={12} fontWeight="500" color={colors.primary} marginTop={4}>
              Blocking users
            </Text>

            <Text fontFamily="$body" fontSize={12} fontWeight="500" color={colors.primary} marginTop={4}>
              Keeping your account secure
            </Text>
          </YStack>
        )}

        <Option label="Another reason" value="other" selected={selected} onSelect={setSelected} />

        {selected === "other" && (
          <YStack marginTop={10}>
            <TextArea
              placeholder="Please provide as much detail as possible"
              placeholderTextColor={colors.placeholderText}
              value={otherText}
              onChangeText={setOtherText}
              height={120}
              borderRadius={12}
              backgroundColor={colors.lightGrayBg}
              padding="$3"
              fontFamily="$body"
            />
          </YStack>
        )}

        {/* ACKNOWLEDGMENT CHECKBOX */}
        {selected && (
          <RNPressable onPress={() => setAcknowledged((p) => !p)} style={{ marginTop: 8 }}>
            <XStack alignItems="center" gap="$3">
              <XStack
                width={20}
                height={20}
                borderRadius={4}
                borderWidth={1.5}
                borderColor={acknowledged ? colors.primary : colors.gray}
                backgroundColor={acknowledged ? colors.primary : "transparent"}
                alignItems="center"
                justifyContent="center"
              >
                {acknowledged && (
                  <Text fontSize={14} color={colors.white} fontWeight="700">
                    ✓
                  </Text>
                )}
              </XStack>
              <Text fontFamily="$body" fontSize={12} fontWeight="400" color={colors.gray} flex={1}>
                I understand this action is permanent and my account will be deleted
              </Text>
            </XStack>
          </RNPressable>
        )}
      </YStack>

      {/* BUTTON */}
      <YStack padding={16}>
        <SimpleButton
          text="Delete account"
          onPress={handleDelete}
          disabled={!isValid || deleteAccount.isPending}
          color={isValid ? colors.DEBIT_RED : colors.inactiveButton}
          textColor={colors.white}
        />
      </YStack>

      {/* PASSWORD CONFIRMATION MODAL */}
      <Modal
        visible={passwordVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPasswordVisible(false)}
      >
        <RNPressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}
          onPress={() => setPasswordVisible(false)}
        >
          <RNPressable
            onPress={() => {}}
            style={{ width: "85%", backgroundColor: "white", borderRadius: 16, padding: 24 }}
          >
            <Text fontFamily="$body" fontSize={16} fontWeight="600" color={colors.black} marginBottom={8}>
              Confirm Password
            </Text>
            <Text fontFamily="$body" fontSize={12} fontWeight="400" color={colors.gray} marginBottom={20}>
              Enter your password to confirm account deletion.
            </Text>

            <RNTextInput
              value={password}
              onChangeText={(t) => { setPassword(t); setPasswordError(""); }}
              placeholder="Password"
              placeholderTextColor={colors.placeholderText}
              secureTextEntry
              autoFocus
              style={{
                borderWidth: 1,
                borderColor: passwordError ? colors.DEBIT_RED : colors.border,
                borderRadius: 10,
                padding: 14,
                fontSize: 14,
                fontFamily: "System",
                color: colors.black,
              }}
            />

            {passwordError ? (
              <Text fontFamily="$body" fontSize={12} color={colors.DEBIT_RED} marginTop={8}>
                {passwordError}
              </Text>
            ) : null}

            <XStack gap={12} marginTop={20} justifyContent="flex-end">
              <SimpleButton
                text="Cancel"
                onPress={() => setPasswordVisible(false)}
                color={colors.lightGrayBg}
                textColor={colors.black}
                paddingHorizontal={20}
                paddingVertical={10}
              />
              <SimpleButton
                text={verifying ? "Verifying..." : "Confirm"}
                onPress={confirmWithPassword}
                loading={verifying}
                color={colors.DEBIT_RED}
                textColor={colors.white}
                paddingHorizontal={20}
                paddingVertical={10}
              />
            </XStack>
          </RNPressable>
        </RNPressable>
      </Modal>

      <SuccessModal
        visible={successModalVisible}
        onClose={() => { setSuccessModalVisible(false); router.replace("/(auth)"); }}
        title="Account deleted"
        message="Your account has been permanently deleted."
        type="success"
        autoClose={false}
        withButton
        buttonText="OK"
        onButtonPress={() => router.replace("/(auth)")}
      />

      <ErrorModal
        visible={errorVisible}
        onClose={() => setErrorVisible(false)}
        message={errorMessage}
      />
    </SafeAreaView>
  );
}

/* OPTION COMPONENT */
function Option({
  label,
  value,
  selected,
  onSelect,
}: {
  label: string;
  value: Reason;
  selected: Reason;
  onSelect: (value: Reason) => void;
}) {
  const isSelected = selected === value;

  return (
    <RNPressable onPress={() => onSelect(value)}>
      <XStack alignItems="center" gap="$3" marginBottom={14}>
        <XStack
          width={18}
          height={18}
          borderRadius={9}
          borderWidth={1}
          borderColor={isSelected ? colors.DEBIT_RED : colors.gray}
          alignItems="center"
          justifyContent="center"
        >
          {isSelected && (
            <XStack
              width={10}
              height={10}
              borderRadius={5}
              backgroundColor={colors.DEBIT_RED}
            />
          )}
        </XStack>

        <Text fontFamily="$body" fontSize={14} fontWeight="400" color={colors.black}>
          {label}
        </Text>
      </XStack>
    </RNPressable>
  );
}