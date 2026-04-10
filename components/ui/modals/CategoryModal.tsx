import { useCategoryStore } from "@/store/categoryStore";
import { Category } from "@/types/category";

import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { Text, View, XStack } from "tamagui";
import BaseModal from "./BaseModal";

const { height } = Dimensions.get("window");

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (category: Category) => void;
}

export default function CategoryModal({ visible, onClose, onSelect }: Props) {
  const categories = useCategoryStore((s) => s.categories);

  return (
    <BaseModal visible={visible} onClose={onClose} alignBottom>
      <View style={styles.sheet}>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.row,
                {
                  backgroundColor: item.bgColor,
                  borderColor: item.bdColor,
                },
              ]}
              onPress={() => onSelect(item)}
            >
              <XStack
                alignItems="center"
                justifyContent="space-between"
                gap="$3"
              >
                <Text fontWeight="600" fontFamily="$heading" fontSize={20}>
                  {item.label}
                </Text>

                {/* ALWAYS RENDER IMAGE */}
                <Image
                  source={
                    item.icon ?? require("@/assets/images/tagIcon.png")
                  }
                  style={styles.icon}
                />
              </XStack>
            </TouchableOpacity>
          )}
        />
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    height: height * 0.4,
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  icon: {
    width: 30,
    height: 40,
    resizeMode: "contain",
  },
});