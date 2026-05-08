import colors from "@/constants/colors";
import { ChevronLeft } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { Pressable } from "react-native";
import { View } from "tamagui";

export default function BackButton() {
  return (
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
      <Pressable onPress={() => router.back()}>
        <ChevronLeft color={colors.white} size={20} />
      </Pressable>
    </View>
  );
}
