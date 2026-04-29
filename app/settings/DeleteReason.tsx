import Header from "@/components/layout/header";
import { SimpleButton } from "@/components/ui/centerTextButton";
import colors from "@/constants/colors";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pressable as RNPressable } from "react-native";
import { Text, XStack, YStack, TextArea } from "tamagui";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { authApi } from "@/services/api/authApi";

type Reason =
  | "temporary"
  | "safety"
  | "trouble"
  | "other"
  | null;

export default function DeleteReasonScreen() {
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clearSession);
  const [selected, setSelected] = useState<Reason>(null);
  const [otherText, setOtherText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const isValid =
    selected &&
    (selected !== "other" || otherText.trim().length > 0);

  const handleDelete = async () => {
    if (!isValid) return;
    setIsDeleting(true);
    try {
      await authApi.deleteAccount();
      clearSession();
      router.replace("/(auth)");
    } catch (error) {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      
      {/* HEADER */}
      <XStack padding={10}>
        <Header
          heading=""
          headerFontFamily="$body"
          headingWeight="500"
        />
      </XStack>

      <YStack flex={1} paddingHorizontal={16}>
        {/* TITLE */}
        <Text fontFamily="$body" fontSize={14} marginBottom={6} color={colors.black}>
          Before you go, we may be of help?
        </Text>

        <Text fontFamily="$body" fontSize={12} color={colors.gray} marginBottom={20}>
          We are so sorry to see you leave, before you go, please let us know why
          you are thinking of leaving, so we can help with common issues and
          improve our service
        </Text>

        {/* OPTIONS */}
        <Option label="It is a temporary decision" value="temporary" selected={selected} onSelect={setSelected} />
        
        {selected === "temporary" && (
          <YStack marginBottom={12} paddingLeft={26}>
            <Text fontFamily="$body" fontSize={12} color={colors.gray}>
              If you may return in the future, consider deactivating your account
              instead. Deactivation lets you restore your account at any time.
            </Text>

            <RNPressable onPress={() => router.push("/settings/DeactivateAccount")}>
              <Text fontFamily="$body" fontSize={12} color={colors.primary} marginTop={6}>
                Deactivate account instead
              </Text>
            </RNPressable>
          </YStack>
        )}

        <Option label="Safety or privacy concerns" value="safety" selected={selected} onSelect={setSelected} />

        {selected === "safety" && (
          <YStack marginBottom={12} paddingLeft={26}>
            <Text fontFamily="$body" fontSize={12} color={colors.gray}>
              Try this instead:
            </Text>

            <Text fontFamily="$body" fontSize={12} color={colors.primary} marginTop={6}>
              Report a problem
            </Text>

            <Text fontFamily="$body" fontSize={12} color={colors.primary} marginTop={4}>
              Blocking users
            </Text>

            <Text fontFamily="$body" fontSize={12} color={colors.primary} marginTop={4}>
              Keeping your account secure
            </Text>
          </YStack>
        )}

        <Option label="Trouble getting started" value="trouble" selected={selected} onSelect={setSelected} />

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
      <YStack padding={16}>
        <SimpleButton
          text="Delete account"
          onPress={handleDelete}
          disabled={!isValid || isDeleting}
          color={isValid ? colors.DEBIT_RED : colors.inactiveButton}
          textColor={colors.white}
        />
      </YStack>
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

        <Text fontFamily="$body" fontSize={14} color={colors.black}>
          {label}
        </Text>
      </XStack>
    </RNPressable>
  );
}