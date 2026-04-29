import colors from "@/constants/colors";
import { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { Button, Text, View, XStack, Spinner } from "tamagui"; 

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
  loading?: boolean;
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
  loading = false,
  fontfamily="$body",
  style,
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Button
      onPress={onPress}
      disabled={isDisabled}
      style={style}
      backgroundColor={isDisabled ? colors.inactiveButton : color}
      borderWidth={1}
      borderColor={colors.borderColor}
      pressStyle={{ opacity: 0.85 }}
      height={"$4"}
    >
      <XStack width={"100%"} justifyContent="space-between" alignItems="center">
        <View width={iconSize} height={iconSize} alignSelf="flex-start">
          {startIcon && startIcon}
        </View>

        {loading ? (
          <Spinner color={textColor ?? "#F6EAFA"} size="small" />
        ) : (
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
        )}

        <View width={iconSize} height={iconSize} alignSelf="flex-end">
          {endIcon && endIcon}
        </View>
      </XStack>
    </Button>
  );
}
