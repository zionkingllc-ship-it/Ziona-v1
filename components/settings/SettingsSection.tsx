import { ViewStyle } from "react-native";
import { ReactNode } from "react";
import { Text, YStack } from "tamagui";
import colors from "@/constants/colors";

interface SettingsSectionProps {
  title?: string;
  children: ReactNode;
  style?: ViewStyle;
}

export function SettingsSection({
  title,
  children,
  style,
}: SettingsSectionProps) {
  return (
    <YStack marginTop={20} style={style}>
      {title && (
        <Text
          fontFamily="$body"
          fontSize={13}
          color={colors.gray}
          marginBottom={6}
        >
          {title}
        </Text>
      )}
      <YStack
        backgroundColor={colors.sectionBackground}
        borderRadius={12}
        overflow="hidden"
      >
        {children}
      </YStack>
    </YStack>
  );
}