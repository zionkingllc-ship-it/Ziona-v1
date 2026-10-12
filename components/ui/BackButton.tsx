import colors from "@/constants/colors";
import { ChevronLeft } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { Pressable } from "react-native";
import { View } from "tamagui";

type Props = {
  onBack?: () => void;
  size?: number;
};

export default function BackButton({ onBack, size = 25 }: Props) {
  return (
    <Pressable
      hitSlop={12}
      accessibilityLabel="Go back"
      onPress={onBack || (() => router.back())}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: 99,
          backgroundColor: "#0000006c",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ChevronLeft color={colors.white} size={Math.round(size * 0.8)} />
      </View>
    </Pressable>
  );
}
