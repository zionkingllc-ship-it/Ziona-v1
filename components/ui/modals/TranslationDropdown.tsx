import { Pressable, StyleSheet } from "react-native";
import { View, Text } from "tamagui";

interface TranslationOption {
  name: string;
  abbreviation?: string;
}

interface Props {
  visible: boolean;
  options: TranslationOption[];
  onSelect: (v: string) => void;
}

export default function TranslationDropdown({
  visible,
  options,
  onSelect,
}: Props) {
  if (!visible) return null;
  return (
    <View style={styles.dropdown}>
      {options.map((item) => (
        <Pressable
          key={item.name}
          style={styles.row}
          onPress={() => onSelect(item.name)}
        >
          <Text fontFamily={"$body"} fontWeight={"600"}>
            {item.abbreviation || item.name}
          </Text>
          <Text fontFamily={"$body"} fontSize={10} color="gray">
            {item.name}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    position: "absolute",
    top: 60,
    left: 20,
    width: 100,
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EEE",
    elevation: 4,
  },
  row: {
    padding: 10,
  },
});