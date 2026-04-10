import colors from "@/constants/colors";
import { useResponsive } from "@/hooks/useResponsive";
import { Category } from "@/types/category";
import { Image, Text, View, XStack, YStack } from "tamagui";

interface Props {
  category?: Category;
  scripture?: string;
  translation?: string;
  verseText?: string;
  testimonyText?: string;
}

export default function TextPostCardOutput({
  category,
  scripture,
  translation,
  verseText,
  testimonyText,
}: Props) {
  const { wp, hp, fs } = useResponsive();

  const hasHeader = category || scripture;
  const hasVerse = !!verseText;
  const hasTestimony = !!testimonyText;
  const flapImage = require("@/assets/images/jounalFlap.png");
  return (
    <View flex={1} width={"100%"}>
      <View
        position="absolute"
        left={-wp(2)}
        bottom={-hp(5)}
        pointerEvents="none"
      >
        <Image
          source={flapImage}
          width={wp(14)}
          height={hp(12)}
          resizeMode="contain"
        />
      </View>
      <XStack
        flex={1}
        backgroundColor={category?.bgColor ?? "#ffc904b8"}
        padding={hp(1.5)}
        borderRadius={wp(1.5)}
      >
        {/* Decorative Strip */}
        <YStack
          width={wp(3)}
          height={"110%"}
          marginTop={-wp(3)}
          backgroundColor={"#573f2114"}
        />

        {/* Content */}
        <YStack flex={1} padding={hp(1)}>
          {/* HEADER */}
          {hasHeader && (
            <YStack
              paddingBottom={hp(1.5)}
              borderBottomWidth={1}
              borderColor="#62292E"
              marginBottom={hp(2)}
            >
              {category && (
                <Text
                  fontFamily="$script"
                  fontWeight="600"
                  fontSize={fs(15)}
                  color={colors.black}
                >
                  {category.label}
                </Text>
              )}

              {scripture && (
                <XStack justifyContent="space-between" alignItems="center">
                  <Text
                    fontFamily="$script"
                    fontWeight="600"
                    fontSize={fs(15)}
                    color={colors.black}
                  >
                    {scripture}
                  </Text>

                  {translation && (
                    <View
                      borderWidth={1}
                      borderColor="#836F8B"
                      borderRadius={wp(2)}
                      paddingHorizontal={wp(3)}
                      paddingVertical={hp(0.6)}
                    >
                      <Text
                        fontFamily="$body"
                        fontWeight="600"
                        fontSize={fs(11)}
                        color="#836F8B"
                      >
                        {translation}
                      </Text>
                    </View>
                  )}
                </XStack>
              )}
            </YStack>
          )}

          {/* VERSE */}
          {hasVerse && (
            <View
              borderLeftWidth={3}
              borderLeftColor="#62292E"
              paddingLeft={wp(4)}
              marginBottom={hp(2)}
            >
              <Text
                fontFamily="$heading"
                fontWeight="400"
                fontSize={fs(17)}
                fontStyle="italic"
                color={colors.black}
                lineHeight={fs(25)}
              >
                {verseText}
              </Text>
            </View>
          )}

          {/* TESTIMONY */}
          {hasTestimony && (
            <Text
              fontFamily="$heading"
              fontWeight="400"
              fontSize={fs(17)}
              color={colors.black}
              lineHeight={fs(25)}
            >
              {testimonyText}
            </Text>
          )}
        </YStack>
      </XStack>
    </View>
  );
}
