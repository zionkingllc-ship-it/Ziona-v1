import Header from "@/components/layout/header";
import { SimpleButton } from "@/components/ui/centerTextButton";
import SuccessModal from "@/components/ui/modals/successModal";
import ErrorModal from "@/components/ui/modals/ErrorModal";
import colors from "@/constants/colors";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pressable as RNPressable } from "react-native";
import { Text, XStack, YStack, TextArea } from "tamagui";
import { useRouter } from "expo-router";
import { useDeactivateAccount } from "@/hooks/useAccountSettings";
import { getErrorMessage } from "@/utils/error";

type Reason =
  | "temporary"
  | "safety"
  | "trouble"
  | "other"
  | null;

export default function DeactivateReasonScreen() {
  const router = useRouter();
  const deactivateAccount = useDeactivateAccount();
  const [selected, setSelected] = useState<Reason>(null);
  const [otherText, setOtherText] = useState("");
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const isValid =
    selected !== null &&
    (selected !== "other" || otherText.trim().length > 0);

  const handleDeactivate = () => {
    if (!isValid || deactivateAccount.isPending) return;
    deactivateAccount.mutate(undefined, {
      onSuccess: () => setSuccessModalVisible(true),
      onError: (error: any) => {
        setErrorMessage(getErrorMessage(error) || "Failed to deactivate account. Please try again.");
        setErrorVisible(true);
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>

      {/* HEADER */}
      <Header
        heading=""
        headerFontFamily="$body"
        headingWeight="500"
      />

      <YStack paddingHorizontal={16}>
        {/* TITLE */}
        <Text fontFamily="$body" fontSize={16} fontWeight="600" marginBottom={6} color={colors.black}>
          Before you go, we may be of help?
        </Text>

        <Text fontFamily="$body" fontSize={13} fontWeight="400" color={colors.gray} marginBottom={20}>
          We are so sorry to see you leave, before you go, please let us know why
          you are thinking of leaving, so we can help with common issues and
          improve our service
        </Text>

        {/* OPTIONS */}
        <Option label="It is a temporary decision" value="temporary" selected={selected} onSelect={setSelected} />

        {selected === "temporary" && (
          <YStack marginBottom={12} paddingLeft={26}>
            <Text fontFamily="$body" fontSize={13} fontWeight="400" color={colors.gray}>
              If you may return in the future, you can reactivate anytime — your data is kept.
            </Text>
          </YStack>
        )}

        <Option label="Safety or privacy concerns" value="safety" selected={selected} onSelect={setSelected} />

        {selected === "safety" && (
          <YStack marginBottom={12} paddingLeft={26}>
            <Text fontFamily="$body" fontSize={13} fontWeight="500" color={colors.gray}>
              Try this instead:
            </Text>

            <Text fontFamily="$body" fontSize={13} fontWeight="500" color={colors.primary} marginTop={6}>
              Report a problem
            </Text>

            <Text fontFamily="$body" fontSize={13} fontWeight="500" color={colors.primary} marginTop={4}>
              Blocking users
            </Text>

            <Text fontFamily="$body" fontSize={13} fontWeight="500" color={colors.primary} marginTop={4}>
              Keeping your account secure
            </Text>
          </YStack>
        )}

        <Option label="Trouble getting started" value="trouble" selected={selected} onSelect={setSelected} />

        {selected === "trouble" && (
          <YStack marginBottom={12} paddingLeft={26}>
            <Text fontFamily="$body" fontSize={13} fontWeight="500" color={colors.gray}>
              Try this instead:
            </Text>

            <Text fontFamily="$body" fontSize={13} fontWeight="500" color={colors.primary} marginTop={6}>
              Report a problem
            </Text>

            <Text fontFamily="$body" fontSize={13} fontWeight="500" color={colors.primary} marginTop={4}>
              Blocking users
            </Text>

            <Text fontFamily="$body" fontSize={13} fontWeight="500" color={colors.primary} marginTop={4}>
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
      </YStack>

      {/* BUTTON */}
      <YStack padding={16} marginTop={15}>
        <SimpleButton
          text="Deactivate account"
          onPress={handleDeactivate}
          disabled={!isValid || deactivateAccount.isPending}
          color={isValid ? colors.DEBIT_RED : colors.inactiveButton}
          textColor={colors.white}
        />
      </YStack>

      <SuccessModal
        visible={successModalVisible}
        onClose={() => { setSuccessModalVisible(false); router.replace("/(auth)"); }}
        title="Account deactivated"
        message="Your account has been deactivated. You can reactivate by logging in again."
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
          borderColor={isSelected ? colors.primary : colors.gray}
          alignItems="center"
          justifyContent="center"
        >
          {isSelected && (
            <XStack
              width={10}
              height={10}
              borderRadius={5}
              backgroundColor={colors.primary}
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
