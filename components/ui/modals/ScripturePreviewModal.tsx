import { Dimensions, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View, YStack } from "tamagui";
import BaseModal from "./BaseModal";

const { height } = Dimensions.get("window");

interface Props {
  visible: boolean;
  scripture: string;
  reference: string;
  onClose: () => void;
}

// FIX: name must match import
export default function ScriptureReaderModal({
  visible,
  scripture,
  reference,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View
        style={[styles.sheet, { height: height - insets.top - insets.bottom }]}
      >
        <YStack gap="$3">
          <Text fontWeight="700" fontSize={18} color="#6B2FA3">
            {reference}
          </Text>

          <Text lineHeight={24}>{scripture}</Text>
        </YStack>
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
});