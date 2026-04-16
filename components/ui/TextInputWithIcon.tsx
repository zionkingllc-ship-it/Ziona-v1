import colors from "@/constants/colors";
import { useResponsive } from "@/hooks/useResponsive";
import { ReactNode } from "react";
import { Image, Pressable, ImageSourcePropType, TextInputProps } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import BaseInput from "@/components/ui/BaseTextInput";

type InputType = "numeric" | "alphanumeric";

type AppTextInputProps = TextInputProps & {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  startImage?: ImageSourcePropType;
  endImage?: ImageSourcePropType;
  inputType?: InputType;
  onEndIconPress?: () => void;
  endIconVisible?: boolean;
  headingText: string;
  isValid?: boolean;
  fontFamily?: string;
  isFocused?: boolean;
};

export function TextInputWithIcon({
  value,
  onChangeText,
  isValid,
  placeholder,
  startIcon,
  endIconVisible,
  endIcon,
  headingText,
  startImage,
  endImage,
  fontFamily = "System",
  inputType = "alphanumeric",
  onEndIconPress,
  isFocused,
  ...props
}: AppTextInputProps) {
  const { wp, hp, fs } = useResponsive();

  const borderColor =
    isValid === false
      ? colors.errorBorderColor
      : isValid === true
      ? colors.successBorder
      : colors.borderColor;

  const backgroundColor =
    isValid === false
      ? colors.errorBackground
      : isValid === true
      ? colors.successBackground
      : colors.borderBackground;

  const headerColor =
    isValid === false
      ? colors.errorText
      : isValid === true
      ? colors.successText
      : colors.inputTitle;

  const INPUT_HEIGHT = hp(7);
  const INPUT_MIN_HEIGHT = 48;
  const ICON_SIZE = wp(5);

  const handleChange = (text: string) => {
    if (inputType === "numeric") {
      onChangeText(text.replace(/[^0-9]/g, ""));
    } else {
      onChangeText(text);
    }
  };

  const showHeading = isFocused || value.length > 0;

  return (
    <XStack
      alignItems="center"
      paddingHorizontal={wp(3)}
      paddingVertical={wp(1.5)}
      minHeight={Math.max(INPUT_HEIGHT, INPUT_MIN_HEIGHT)}
      height={INPUT_HEIGHT}
      width="100%"
      borderColor={borderColor}
      backgroundColor={backgroundColor}
      borderWidth={1}
      borderRadius={wp(2.5)}
    >
      {startIcon && <YStack marginRight={wp(2)}>{startIcon}</YStack>}

      {startImage && (
        <Image
          source={startImage}
          style={{ width: ICON_SIZE, height: ICON_SIZE, marginRight: wp(2) }}
          resizeMode="contain"
        />
      )}

      <YStack flex={1} justifyContent="center">
        {showHeading && (
          <Text fontSize={fs(10)} color={headerColor} marginBottom={hp(0.3)}>
            {headingText}
          </Text>
        )}

        <BaseInput
          {...props}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={colors.placeHolderText}
          keyboardType={
            props.keyboardType ??
            (inputType === "numeric" ? "number-pad" : "default")
          }
          style={{
            fontSize: fs(16),
            color: colors.black,
            fontFamily,
            lineHeight: fs(20),
            paddingVertical: 0,
          }}
          onChangeText={handleChange}
        />
      </YStack>

      {(endIconVisible && endIcon && onEndIconPress) && (
        <Pressable
          onPress={onEndIconPress}
          hitSlop={10}
          style={{ marginLeft: wp(2) }}
        >
          <YStack>{endIcon}</YStack>
        </Pressable>
      )}
    </XStack>
  );
}