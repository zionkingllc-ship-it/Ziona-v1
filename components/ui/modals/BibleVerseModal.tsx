import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, Dimensions } from "react-native";
import { Text, View, Button } from "tamagui";
import BaseModal from "./BaseModal";

const { height } = Dimensions.get("window");

interface Verse {
  number: number;
  text: string;
}

interface Props {
  visible: boolean;
  verses: Verse[];
  onClose: () => void;
  onDone: (verses: number[], text: string) => void;
}

export default function BibleVerseModal({
  visible,
  verses,
  onClose,
  onDone,
}: Props) {
  const [selected, setSelected] = useState<number[]>([]);

  function toggle(n: number) {
    setSelected((prev) =>
      prev.includes(n) ? prev.filter((v) => v !== n) : [...prev, n]
    );
  }

  return (
    <BaseModal visible={visible} onClose={onClose} alignBottom>
      <View style={styles.sheet}>
        <Text fontWeight="600" marginBottom={10}>
          Verse
        </Text>

        <View style={{ flex: 1 }}>
          <FlatList
            data={verses}
            numColumns={7}
            keyExtractor={(item) => item.number.toString()}
            renderItem={({ item }) => {
              const active = selected.includes(item.number);

              return (
                <Pressable
                  onPress={() => toggle(item.number)}
                  style={[
                    styles.cell,
                    active && { backgroundColor: "#181419" },
                  ]}
                >
                  <Text color={active ? "white" : "black"}>
                    {item.number}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>

        <Button
          marginTop={12}
          onPress={() => {
            const text = verses
              .filter((v) => selected.includes(v.number))
              .map((v) => v.text)
              .join(" ");

            onDone(selected, text);
          }}
        >
          Done
        </Button>
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    height: height * 0.65,
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