import React from "react";
import { FlatList, Pressable, StyleSheet, Dimensions } from "react-native";
import { Text, View } from "tamagui";
import BaseModal from "./BaseModal";

const { height } = Dimensions.get("window");

interface Props {
  visible: boolean;
  chapters: number;
  onClose: () => void;
  onSelect: (chapter: number) => void;
}

export default function BibleChapterModal({
  visible,
  chapters,
  onClose,
  onSelect,
}: Props) {
  const numbers = Array.from({ length: chapters }, (_, i) => i + 1);

  return (
    <BaseModal visible={visible} onClose={onClose} alignBottom>
      <View style={styles.sheet}>
        <Text fontWeight="600" marginBottom={10}>
          Chapter
        </Text>

        <View style={{ flex: 1 }}>
          <FlatList
            data={numbers}
            numColumns={7}
            keyExtractor={(item) => item.toString()}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => onSelect(item)}
                style={styles.cell}
              >
                <Text>{item}</Text>
              </Pressable>
            )}
          />
        </View>
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    height: height * 0.6,
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cell: {
    width: 45,
    height: 45,
    margin: 4,
    borderRadius: 8,
    backgroundColor: "#F3F3F3",
    alignItems: "center",
    justifyContent: "center",
  },
});