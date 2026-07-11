import colors from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { ChevronLeft } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import React from "react";
import { ImageSourcePropType, Pressable } from "react-native";
import { Image, Text, XStack } from "tamagui";

type prop = {
  heading?: string;
  iconAfter?: any;
  iconAfter2?: any;
  imageAfter?: ImageSourcePropType;
  imageAfter2?: ImageSourcePropType;
  imageAfter2Press?: () => void;
  iconBeforeColor?: string;
  headingSize?: any;
  headingWeight?: any;
  headerFontFamily?: any;
  onBackPress?: () => void;
  onIconAfterPress?: () => void;
};

export default function Header({
  heading,
  iconAfter,
  iconBeforeColor,
  headingSize,
  imageAfter,
  iconAfter2,
  imageAfter2,
  imageAfter2Press,
  headingWeight = "500",
  headerFontFamily = "$body",
  onBackPress,
  onIconAfterPress,
}: prop) {
  return (
    <XStack width={"100%"} alignItems="center" paddingLeft={20} minHeight={48}>
      <ChevronLeft
        size={24} 
        color={iconBeforeColor ? iconBeforeColor : colors.black}
        onPress={onBackPress || (() => router.back())}
      />
      <XStack flex={1} justifyContent="center" alignItems="center" marginRight={44}>
        <Text
          fontFamily={headerFontFamily}
          fontSize={headingSize ? headingSize : "$4"}
          fontWeight={headingWeight}
          textAlign="center"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ flexShrink: 1 }}
        >
          {heading}
        </Text>
      </XStack>

      <XStack gap={5} position="absolute" right={10}>
        {iconAfter ? (
          <Pressable onPress={onIconAfterPress}>
            <Ionicons name={iconAfter} size={24} color={colors.black} />
          </Pressable>
        ) : imageAfter2 ? (
          <Pressable onPress={imageAfter2Press}>
            <Image source={imageAfter2} width={24} height={24} marginRight={10} />
          </Pressable>
        ) : imageAfter ? (
          <Image source={imageAfter} width={24} height={24} marginRight={10} />
        ) : null}
      </XStack>
    </XStack>
  );
}
