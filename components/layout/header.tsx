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
}: prop) {
  return (
    <XStack width={"100%"} justifyContent="space-between" alignItems="center">
      <ChevronLeft
        size={24} 
        marginTop={5}
        color={iconBeforeColor ? iconBeforeColor : colors.black}
        onPress={() => router.back()}
      />
      <Text
        fontFamily={headerFontFamily}
        fontSize={headingSize ? headingSize : "$4"}
        fontWeight={headingWeight}
      >
        {heading}
      </Text>

      {iconAfter ? (
        <XStack gap={5}>
          <Ionicons type={iconAfter} size={24} />
          {iconAfter2 && <Ionicons type={iconAfter2} size={24} />}
        </XStack>
      ) : (
        <XStack gap={5}>
          {imageAfter && (
            <Image source={imageAfter} width={24} height={24} marginRight={10} />
          )}
          {imageAfter2 && (
            <Pressable onPress={imageAfter2Press}>
              <Image
                source={imageAfter2}
                width={24}
                height={24}
                marginRight={10}
              />
            </Pressable>
          )}
        </XStack>
      )}
    </XStack>
  );
}
