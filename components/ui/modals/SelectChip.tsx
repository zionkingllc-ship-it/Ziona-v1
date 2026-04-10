import { ChevronDown } from "@tamagui/lucide-icons";
import { Pressable, StyleSheet } from "react-native";
import { Text, XStack } from "tamagui";

interface Props {
  label: string;
  active?: boolean;
  onPress: () => void;
}

export default function SelectChip({ label, active, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, active && styles.active]}
    >
      <XStack alignItems="center" justifyContent="center" gap="$1">
        <Text fontSize={12} fontFamily={"$body"} fontWeight="600" textAlign="center">
          {label}
        </Text>
        <ChevronDown size={14} />
      </XStack>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 32,
    marginVertical:10,
    borderRadius: 14,
    borderWidth: 0.2,
    borderColor: "#332B36",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },

  active: {
    backgroundColor: "#EAD9F3",
    borderColor: "#EAD9F3",
  },
});
