import colors from "@/constants/colors";
import { useResponsive } from "@/hooks/useResponsive";
import { TextInput } from "react-native";
import { Image, Text, View, XStack, YStack } from "tamagui";
import { useState } from "react";
import SuccessModal from "../ui/modals/successModal";

interface Props {
  category?: string;
  backgroundColor?: string;

  scripture?: string;
  translation?: string;
  verseText?: string;

  value: string;
  onChangeText: (text: string) => void;

  maxLength?: number;

  showInput?: boolean;
}

export default function TextPostCardInput({
  category,
  backgroundColor = "#E6E2C5",

  scripture,
  translation,
  verseText,

  value,
  onChangeText,
  maxLength = 500,

  showInput = true,
}: Props) {
  const { wp, hp, fs } = useResponsive();

  const [errorVisible, setErrorVisible] = useState(false);
  const [remainingError, setRemainingError] = useState(0);

  const flapImage = require("@/assets/images/jounalFlap2.png");

  const verseLength = verseText ? verseText.length : 0;
  const used = value.length + verseLength;
  const remaining = Math.max(maxLength - used, 0);

  return (
    <View flex={1}>
      {/* ERROR MODAL */}
      <SuccessModal
        visible={errorVisible}
        onClose={() => setErrorVisible(false)}
        type="warning"
        autoClose
        title="Character limit reached"
        message={`You can only add 500 characters`}
      />

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
        backgroundColor={backgroundColor}
        padding={hp(1)}
        minHeight={hp(52)}
        borderRadius={wp(4)}
        borderWidth={wp(1)}
        borderColor={colors.white}
      >
        <YStack
          width={wp(3)}
          height={"103%"}
          marginTop={-wp(1.5)}
          backgroundColor={"#573f2114"}
        />

        <YStack flex={1} padding={hp(1)}>
          {(category || scripture) && (
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
                  {category}
                </Text>
              )}

              <XStack justifyContent="space-between" alignItems="center">
                {scripture && (
                  <Text
                    fontFamily="$script"
                    fontWeight="600"
                    fontSize={fs(15)}
                    color={colors.black}
                  >
                    {scripture}
                  </Text>
                )}

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
            </YStack>
          )}

          {verseText && (
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

          <View flex={1} justifyContent="space-between">
            {showInput && (
              <TextInput
                value={value}
                onChangeText={(text) => {
                  const newUsed = text.length + verseLength;

                  if (newUsed > maxLength) {
                    //SHOW ERROR
                    setRemainingError(maxLength - verseLength);
                    setErrorVisible(true);
                    return;
                  }

                  onChangeText(text);
                }}
                placeholder="Whats on your mind?"
                multiline
                style={{
                  flex: 1,
                  fontSize: fs(17),
                  color: colors.black,
                  lineHeight: fs(25),
                  textAlignVertical: "top",
                }}
              />
            )}

            {showInput && (
              <Text
                alignSelf="flex-end"
                fontSize={fs(11)}
                color={
                  used < maxLength / 2
                    ? "#836F8B"
                    : used === maxLength
                    ? colors.errorText
                    : "#ac8101"
                }
                marginTop={hp(1)}
              >
                {used}/{maxLength}
              </Text>
            )}
          </View>
        </YStack>
      </XStack>
    </View>
  );
}