import colors from "@/constants/colors";
import { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { Button, Text, View, XStack } from "tamagui"; 

type AppButtonProps = {
  text: string;
  textColor?: string;
  color?: string;
  onPress?: () => void;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  textSize?: any;
  textWeight?: any;
  /** Size applied to icon container */
  iconSize?: number;
  fontfamily?:any
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({
  text,
  textColor,
  textSize = "$4",
  textWeight = "600",
  onPress,
  color,
  startIcon,
  endIcon,
  iconSize = 20,
  disabled = false,
  fontfamily="$body",
  style,
}: AppButtonProps) {
  return (
    <Button
      onPress={onPress}
      disabled={disabled}
      style={style}
      backgroundColor={disabled ? colors.inactiveButton : color}
      borderWidth={1}
      borderColor={colors.borderColor}
      pressStyle={{ opacity: 0.85 }}
      height={"$4"}
    >
      <XStack width={"100%"}  justifyContent="space-between">
        <View width={iconSize} height={iconSize} alignSelf="flex-start">
          {startIcon && startIcon}
        </View>

        <Text
          color={textColor ? textColor : "black"}
          alignSelf="center"
          textAlign="center"
          fontSize={textSize}
          fontFamily={fontfamily}
          fontWeight={textWeight}
        >
          {text}
        </Text>

        <View width={iconSize} height={iconSize} alignSelf="flex-end">
          {endIcon && endIcon}
        </View>
      </XStack>
    </Button>
  );
}
