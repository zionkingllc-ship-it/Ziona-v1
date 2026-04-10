import { FlatList, Pressable, StyleSheet } from "react-native";
import { Text, View } from "tamagui";
import BaseModal from "./BaseModal";

interface Props {
  visible: boolean;
  data: string[];
  onClose: () => void;
  onSelect: (value: string) => void;
}

export default function SelectListModal({
  visible,
  data,
  onClose,
  onSelect,
}: Props) {
  return (
    <BaseModal visible={visible} onClose={onClose} alignBottom>
      <View style={styles.sheet}>
        <FlatList
          data={data}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() => {
                onSelect(item);
                onClose();
              }}
            >
              <Text>{item}</Text>
            </Pressable>
          )}
        />
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "60%",
  },

  row: {
    paddingVertical: 14,
  },
});
