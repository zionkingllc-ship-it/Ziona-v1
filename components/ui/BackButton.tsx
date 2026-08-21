import colors from "@/constants/colors";
import { ChevronLeft } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { Pressable } from "react-native";
import { View } from "tamagui";

type Props = {
  onBack?: () => void;
};

export default function BackButton({ onBack }: Props) {
  return (
    <Pressable
      hitSlop={12}
      accessibilityLabel="Go back"
      onPress={onBack || (() => router.back())}
    >
      <View
        style={{
          width: 25,
          height: 25,
          borderRadius: 99,
          backgroundColor: "#0000006c",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ChevronLeft color={colors.white} size={20} />
      </View>
    </Pressable>
  );
}
