import React from "react";
import { Modal, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { YStack, XStack, Text } from "tamagui";
import { Ionicons } from "@expo/vector-icons";

type SortOption = "Trending" | "New";
type ViewOption = "All" | "My post";

type Props = {
  visible: boolean;
  onClose: () => void;

  sort: SortOption;
  setSort: (v: SortOption) => void;

  view: ViewOption;
  setView: (v: ViewOption) => void;
};

export default function CircleFeedFilterModal({
  visible,
  onClose,
  sort,
  setSort,
  view,
  setView,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal transparent visible={visible} animationType="fade">
      {/* BACKDROP */}
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
        onPress={onClose}
      />

      {/* SHEET */}
      <YStack
        position="absolute"
        bottom={Platform.OS === "ios" ? Math.max(insets.bottom, 20) + 10 : 30}
        left={0}
        right={0}
        backgroundColor="#F2F2F2"
        borderTopLeftRadius={24}
        borderTopRightRadius={24}
        padding="$4"
        gap="$4"
      >
        {/* Title */}
        <Text textAlign="center" fontWeight="600">
          Filter
        </Text>

        {/* SORT */}
        <YStack gap="$2">
          <Text fontWeight="600">Sort by</Text>

          <OptionRow
            label="Trending"
            icon="flame-outline"
            active={sort === "Trending"}
            onPress={() => setSort("Trending")}
          />

          <OptionRow
            label="New"
            icon="sparkles-outline"
            active={sort === "New"}
            onPress={() => setSort("New")}
          />
        </YStack>

        {/* VIEW */}
        <YStack gap="$2">
          <Text fontWeight="600">View</Text>

          <OptionRow
            label="My post"
            icon="person-outline"
            active={view === "My post"}
            onPress={() => setView("My post")}
          />
        </YStack>
      </YStack>
    </Modal>
  );
}

type RowProps = {
  label: string;
  icon: any;
  active: boolean;
  onPress: () => void;
};

function OptionRow({ label, icon, active, onPress }: RowProps) {
  return (
    <Pressable onPress={onPress}>
      <XStack
        alignItems="center"
        justifyContent="space-between"
        paddingVertical="$3"
        paddingHorizontal="$2"
        borderRadius={12}
        backgroundColor={active ? "#EAEAEA" : "transparent"}
      >
        <XStack alignItems="center" gap="$2">
          <Ionicons name={icon} size={18} color="#333" />
          <Text>{label}</Text>
        </XStack>

        {active && (
          <Ionicons name="checkmark" size={20} color="#000" />
        )}
      </XStack>
    </Pressable>
  );
}