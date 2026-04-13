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
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
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
          borderRadius:30,
          paddingHorizontal: 20,
          width: "70%",
        },
      ]}
    >
      <XStack >
        {loading ? (
          <Spinner color={textColor ?? "#F6EAFA"} size="small" />
        ) : (
          <Text
            color={textColor ?? "black"}
            textAlign="center"
            fontSize={textSize}
            fontWeight={textWeight}
          >
            {text}
          </Text>
        )}
      </XStack>
    </Pressable>
  );
}
