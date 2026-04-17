import { ChevronRight } from "@tamagui/lucide-icons";
import { Pressable, ViewStyle } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import colors from "@/constants/colors";

interface SettingsRowProps {
  icon?: React.ReactNode;
  label: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
  style?: ViewStyle;
}

export function SettingsRow({
  icon,
  label,
  onPress,
  rightElement,
  showChevron = true,
  style,
}: SettingsRowProps) {
  const content = (
    <XStack
      alignItems="center"
      justifyContent="space-between"
      paddingVertical={14}
      paddingHorizontal={12}
      style={style}
    >
      <XStack alignItems="center" gap="$3" flex={1}>
        {icon}
        <Text fontFamily="$body" fontSize={14} color={colors.black}>
          {label}
        </Text>
      </XStack>
      <XStack alignItems="center" gap="$2">
        {rightElement}
        {showChevron && <ChevronRight size={18} color={colors.gray} />}
      </XStack>
    </XStack>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={{ opacity: 0.7 }}>
        {content}
      </Pressable>
    );
  }

  return content;
}