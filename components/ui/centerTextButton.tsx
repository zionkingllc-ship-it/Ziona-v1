import { Button, XStack, Text, Spinner } from "tamagui";
import { StyleProp, ViewStyle } from "react-native";
import colors from "@/constants/colors"; 

type AppButtonProps = {
  text: string;
  textColor?: string;
  color?: string;
  onPress?: () => void;
  textSize?: any;
  textWeight?: any;
  disabled?: boolean;
  fontFamily?:any;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function SimpleButton({
  text,
  textColor,
  textSize = "$4",
  textWeight = "400",
  onPress,
  color,
  fontFamily ="$body",
  disabled = false,
  loading = false,
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
      pressStyle={{ opacity: 0.85 }}
    >
      <XStack width="100%" justifyContent="center" alignItems="center">
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
      </XStack>
    </Button>
  );
}