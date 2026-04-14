// components/feedHeader.tsx
import colorsDefault from "@/constants/colors";
import { Bell } from "@tamagui/lucide-icons";
import { Image } from "react-native";
import { XStack, Text } from "tamagui";
import TwoButtonSwitch from "./ui/twoButtonSwitch";
import { TouchableOpacity } from "react-native";

type FeedHeaderProps = {
  feedType: "forYou" | "following";
  onChangeFeedType: (type: "forYou" | "following") => void;
  emptyFollowing?: boolean;
  onBellPress?: () => void;
  unreadCount?: number;
};

export default function FeedHeader({
  feedType,
  onChangeFeedType,
  emptyFollowing = false,
  onBellPress,
  unreadCount = 0,
}: FeedHeaderProps) {
  const logoSource = emptyFollowing
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
        emptyFollowing={emptyFollowing}
      />

      <TouchableOpacity
        onPress={onBellPress}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(255, 255, 255, 0.24)",
        }}
      >
        <Bell
          size={24}
          stroke={colorsDefault.black}
          color={colorsDefault.white} 
          strokeOpacity={1}
          strokeWidth={2}
        />
        {unreadCount > 0 && (
          <XStack
            position="absolute"
            top={4}
            right={4}
            backgroundColor={colorsDefault.primary}
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
