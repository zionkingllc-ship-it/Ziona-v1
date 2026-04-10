import BaseModal from "./BaseModal";
import { Text, View, YStack } from "tamagui";
import { TouchableOpacity, StyleSheet } from "react-native";
import colors from "@/constants/colors";

interface Props {
  visible: boolean;
  message: string;
  onClose: () => void;
}

export default function ErrorModal({
  visible,
  message,
  onClose,
}: Props) {
  return (
    <BaseModal visible={visible} onClose={onClose} alignBottom>
      <View style={styles.container}>
        <YStack gap="$3">
          <Text
            fontFamily="$body"
            fontWeight="600"
            fontSize={16}
            color={colors.errorText}
          >
            Something went wrong
          </Text>

          <Text
            fontFamily="$body"
            fontSize={14}
            color={colors.errorText}
          >
            {message}
          </Text>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text
              fontFamily="$body"
              fontWeight="600"
              color={colors.white}
            >
              Close
            </Text>
          </TouchableOpacity>
        </YStack>
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.errorBackground,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  button: {
    marginTop: 10,
    backgroundColor: colors.errorText,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});