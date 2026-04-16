import { ViewStyle } from "react-native";
import { ReactNode } from "react";
import { View } from "tamagui";
import colors from "@/constants/colors";

interface SettingsCardProps {
  children: ReactNode;
  style?: ViewStyle;
}

export function SettingsCard({ children, style }: SettingsCardProps) {
  return (
    <View
      backgroundColor={colors.sectionBackground}
      borderRadius={16}
      padding={14}
      style={style}
    >
      {children}
    </View>
  );
}