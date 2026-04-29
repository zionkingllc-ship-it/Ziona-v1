import { Button, XStack, Text, Spinner, ButtonProps } from "tamagui";
import colors from "@/constants/colors";

type AppButtonProps = {
  text: string;
  textColor?: string;
  color?: string;
  onPress?: () => void;
  textSize?: any;
  textWeight?: any;
  disabled?: boolean;
  fontFamily?: any;
  loading?: boolean;
  borderRadius?: number;
} & Omit<ButtonProps, "children">;

export function SimpleButton({
  text,
  textColor,
  textSize = "$4",
  textWeight = "400",
  onPress,
  color,
  fontFamily = "$body",
  disabled = false,
  loading = false,
  borderRadius = 8,
  ...buttonProps
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Button
      onPress={onPress}
      disabled={isDisabled}
      backgroundColor={isDisabled ? colors.inactiveButton : color}
      borderWidth={1}
      borderRadius={borderRadius}
      pressStyle={{ opacity: 0.85 }}
      {...buttonProps}
    >
      {loading ? (
        <Spinner color={textColor ?? "#F6EAFA"} size="small" />
      ) : (
        <Text
          color={textColor ?? "black"}
          fontFamily={fontFamily}
          fontSize={textSize}
          fontWeight={textWeight}
        >
          {text}
        </Text>
      )}
    </Button>
  );
}