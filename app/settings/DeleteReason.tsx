import Header from "@/components/layout/header";
import { SimpleButton } from "@/components/ui/centerTextButton";
import ErrorModal from "@/components/ui/modals/ErrorModal";
import colors from "@/constants/colors";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pressable as RNPressable } from "react-native";
import { Text, XStack, YStack, TextArea } from "tamagui";
import { useRouter } from "expo-router";
import { useDeleteAccount } from "@/hooks/useAccountSettings";

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

  const isValid =
    selected &&
    (selected !== "other" || otherText.trim().length > 0) &&
    acknowledged;

  const handleDelete = () => {
    if (!isValid) return;
    deleteAccount.mutate(
      {
        reason: selected!,
        detail: selected === "other" ? otherText.trim() : undefined,
      },
      {
        onSuccess: () => router.replace("/(auth)"),
        onError: (error: any) => {
          setErrorMessage(error?.message || "Failed to delete account. Please try again.");
          setErrorVisible(true);
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