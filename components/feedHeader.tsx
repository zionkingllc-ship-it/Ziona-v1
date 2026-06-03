// components/feedHeader.tsx
import colorsDefault from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "react-native";
import { XStack, Text } from "tamagui";
import TwoButtonSwitch from "./ui/twoButtonSwitch";
import { TouchableOpacity } from "react-native";

type FeedHeaderProps = {
  feedType: "forYou" | "following";
  onChangeFeedType: (type: "forYou" | "following") => void;
  emptyFeed?: boolean;
  onBellPress?: () => void;
  unreadCount?: number;
};

export default function FeedHeader({
  feedType,
  onChangeFeedType,
  emptyFeed = false,
  onBellPress,
  unreadCount = 0,
}: FeedHeaderProps) {
  const logoSource = emptyFeed
    ? require("@/assets/images/logoColored.png")
    : require("@/assets/images/logowhite.png");

  return (
    <XStack
      position="absolute"
      top={10}
      left={6}
      right={0}
      padding="$3"
      alignItems="center"
      justifyContent="space-between"
      zIndex={10}
    >
      <Image source={logoSource} width={24} height={24} />
 
      <TwoButtonSwitch
        value={feedType}
        onChange={onChangeFeedType}
        width="65%"
        emptyFeed={emptyFeed}
      />

      <TouchableOpacity
        onPress={onBellPress}
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons
          name="notifications"
          size={24}
          color={colorsDefault.white}
        />
        {unreadCount > 0 && (
          <XStack
            position="absolute"
            top={-2}
            right={-4}
            backgroundColor={colorsDefault.DEBIT_RED}
            borderRadius={10}
            minWidth={18}
            height={18}
            paddingHorizontal={4}
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={10} color={colorsDefault.white} fontWeight="bold">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Text>
          </XStack>
        )}
      </TouchableOpacity>
    </XStack>
  );
}
