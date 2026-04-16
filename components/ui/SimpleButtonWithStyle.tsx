import colors from "@/constants/colors";
import { Pressable, StyleProp, ViewStyle } from "react-native";
import { Spinner, Text, XStack } from "tamagui";

type AppButtonProps = {
  text: string;
  textColor?: string;
  color?: string;
  onPress?: () => void;
  textSize?: any;
  textWeight?: any;
  fontFamily?: string
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  borderRadius?: string | number;
};

export function SimpleButtonWithStyle({
  text,
  textColor,
  textSize = "$4",
  textWeight = "600",
  onPress,
  color,
  disabled = false,
  loading = false,
  style,
  borderRadius = 30,
  fontFamily,
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[
        style,
        {
          backgroundColor: isDisabled ? colors.inactiveButton : color,
          height: 50,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: borderRadius,
          paddingHorizontal: 20,
          width: "70%",
        },
      ]}
    >
      <XStack>
        {loading ? (
          <Spinner color={textColor ?? "#F6EAFA"} size="small" />
        ) : (
          <Text
            color={textColor ?? "black"}
            textAlign="center"
            fontSize={textSize}
            fontWeight={textWeight}
            
            fontFamily={fontFamily}
          >
            {text}
          </Text>
        )}
      </XStack>
    </Pressable>
  );
}
