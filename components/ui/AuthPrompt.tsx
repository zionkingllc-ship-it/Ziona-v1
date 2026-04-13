import colors from "@/constants/colors";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Image, View } from "react-native";
import { YStack, Text } from "tamagui";
import { SimpleButtonWithStyle } from "./SimpleButtonWithStyle";

type Props = {
  message?: string;
  buttonText?: string;
  buttonColor?: string;
  onPress?: () => void;
};

export default function AuthPrompt({
  message = "Please login to continue.",
  buttonText = "Login",
  buttonColor = colors.primary,
  onPress,
}: Props) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push("/(auth)/login/signin");
    }
  };

  return (
    <View style={styles.container}>
      <YStack alignItems="center" gap="$4">
        <Image
          source={require("@/assets/images/softWarningImage.png")}
          style={styles.icon}
        />
        <Text fontFamily={"$body"} style={styles.message}>
          {message}
        </Text>
        <SimpleButtonWithStyle
          text={buttonText}
          color={buttonColor}
          textColor={colors.white}
          onPress={handlePress}
          style={styles.button}
        />
      </YStack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: colors.gray,
    textAlign: "center",
    lineHeight: 22,
  },
  button: {
    marginTop: 8,
    minWidth: 120,
  },
});
