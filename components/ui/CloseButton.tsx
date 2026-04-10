import colors from "@/constants/colors";
import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { Text } from "tamagui";

interface Props {
  onPress: () => void;
  size?: number;
  style?: ViewStyle;
}

export default function CloseButton({
  onPress,
  size = 28,
  style,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
    >
      <Text style={styles.text}>✕</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.closeBtn,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 14,
  },
});
