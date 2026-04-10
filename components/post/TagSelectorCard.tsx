import { DiscoverCategory } from "@/types/discover"
import { useResponsive } from "@/hooks/useResponsive"

import { Image, TouchableOpacity } from "react-native"
import { Text, YStack } from "tamagui"

interface Props {
  category?: DiscoverCategory
  onPress: () => void
  disabled?:boolean
}

export default function TagSelectorCard({ category, onPress, disabled }: Props) {
  const { wp, hp, fs } = useResponsive()

  const icon =
    category?.icon ?? require("@/assets/images/tagIcon.png")

  const title = category?.label ?? "Select a tag"

  const subtitle = category ? "Tap to change" : "Choose a category"

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        flex: 0.4,
        backgroundColor: "#F4F3F4",
        borderRadius: wp(2),
        paddingVertical: hp(2),
        alignItems: "center",
      }}
    >
      <Image
        source={icon}
        style={{
          width: wp(6),
          height: wp(6),
          marginBottom: hp(1),
        }}
      />

      <YStack alignItems="center">
        <Text
          fontFamily={"$body"}
          fontSize={fs(14)}
          fontWeight="500"
        >
          {title}
        </Text>

        <Text
          fontFamily={"$body"}
          fontWeight={"400"}
          fontSize={fs(11)}
          color="#8A7F87"
        >
          {subtitle}
        </Text>
      </YStack>
    </TouchableOpacity>
  )
}