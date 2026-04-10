import colors from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { ChevronLeft } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import React from "react";
import { ImageSourcePropType } from "react-native";
import { Image, Text, XStack } from "tamagui";

type prop = {
  heading?: string;
  iconAfter?: any;
  iconAfter2?: any;
  imageAfter?: ImageSourcePropType;
  imageAfter2?: ImageSourcePropType;
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
          <Image source={imageAfter} width={24} height={24} marginRight={10} />
          {imageAfter2 && (
            <Image
              source={imageAfter2}
              width={24}
              height={24}
              marginRight={10}
            />
          )}
        </XStack>
      )}
    </XStack>
  );
}
