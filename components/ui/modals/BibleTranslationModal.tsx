import React from "react";
import { FlatList, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Text, View } from "tamagui";
import BaseModal from "./BaseModal";

import { useBibleTranslations } from "@/hooks/useBibleTranslations";

const { height } = Dimensions.get("window");

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (translation: string) => void;
}

export default function BibleTranslationModal({
  visible,
  onClose,
  onSelect,
}: Props) {
  const { data } = useBibleTranslations();

  return (
    <BaseModal visible={visible} onClose={onClose} alignBottom>
      <View style={styles.sheet}>
        <Text fontWeight="600" marginBottom={10}>
          Choose Translation
        </Text>

        <View style={{ flex: 1 }}>
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.row}
                onPress={() => onSelect(item.id)}
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
    height: height * 0.6,
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  row: {
    paddingVertical: 14,
  },
});