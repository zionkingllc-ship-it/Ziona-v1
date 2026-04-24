import React from "react";
import { YStack, XStack, Text, Image } from "tamagui";
import { Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { height } = Dimensions.get("window");

export default function AnchorImageViewer() {
  return (
    <YStack flex={1} backgroundColor="#EDEDED" paddingTop="$5">
      {/* Top Bar */}
      <XStack
        justifyContent="space-between"
        paddingHorizontal="$4"
        marginBottom="$3"
      >
        <Text color="#666">Cancel</Text>
        <Text color="#666">23h: 10m: 23s</Text>
      </XStack>

      {/* Image */}
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Image
          source={{ uri: "https://your-image-url.jpg" }}
          width="90%"
          height={height * 0.7}
          borderRadius={20}
          resizeMode="cover"
        />
      </YStack>

      {/* Bottom CTA */}
      <XStack
        position="absolute"
        bottom={30}
        left={20}
        right={20}
        justifyContent="space-between"
        alignItems="center"
      >
        <Ionicons name="hand-left-outline" size={18} color="#000" />

        <XStack
          backgroundColor="#000"
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderRadius={20}
          alignItems="center"
          gap="$2"
        >
          <Ionicons name="chatbubble-outline" size={16} color="#FFF" />
          <Text color="#FFF">Your reflection...</Text>
        </XStack>
      </XStack>
    </YStack>
  );
}