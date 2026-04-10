import React, { useState } from "react";
import { FlatList, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Text, View, XStack } from "tamagui";
import BaseModal from "./BaseModal";

import { useBibleBooks } from "@/hooks/useBibleBooks";

const { height } = Dimensions.get("window");

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (book: string) => void;
}

export default function BibleBookModal({
  visible,
  onClose,
  onSelect,
}: Props) {
  const { data } = useBibleBooks();
  const [tab, setTab] = useState<"old" | "new">("old");

  const books = data.filter((b) => b.testament === tab);

  return (
    <BaseModal visible={visible} onClose={onClose} alignBottom>
      <View style={styles.sheet}>
        <Text fontWeight="600" marginBottom={10}>
          Books
        </Text>

        <XStack gap="$2" marginBottom={12}>
          <TouchableOpacity onPress={() => setTab("old")}>
            <Text color={tab === "old" ? "#7A2E8A" : "#888"}>
              Old Testament
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setTab("new")}>
            <Text color={tab === "new" ? "#7A2E8A" : "#888"}>
              New Testament
            </Text>
          </TouchableOpacity>
        </XStack>

        <View style={{ flex: 1 }}>
          <FlatList
            data={books}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.row}
                onPress={() => onSelect(item.name)}
              >
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    height: height * 0.7,
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  row: {
    paddingVertical: 12,
  },
});