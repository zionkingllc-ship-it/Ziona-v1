import colors from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { ChevronLeft } from "@tamagui/lucide-icons";
import React from "react";
import { Pressable, TextInput } from "react-native";
import { XStack } from "tamagui";

interface Props {
  withBackbutton?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  onBackPress?: () => void;
  placeholder?: string;
}

export default function SearchHeader({
  value,
  onChangeText,
  onBackPress,
  placeholder = "Search",
}: Props) {
  return (
    <XStack alignItems="center" padding={10}>
      {onBackPress && (
        <Pressable onPress={onBackPress}>
          <ChevronLeft size={24} color={colors.text} />
        </Pressable>
      )}

      <XStack
        flex={1}
        margin={16}
        borderRadius={12}
        borderWidth={1}
        borderColor={colors.border}
        paddingHorizontal={10}
        alignItems="center"
        gap={8}
      >
        <Ionicons name="search" size={20} color={colors.tertiary} />

        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          style={{
            flex: 1,
            height: 40,
            fontFamily: "MonaSans", 
          }}
        />
      </XStack>
    </XStack>
  );
}
