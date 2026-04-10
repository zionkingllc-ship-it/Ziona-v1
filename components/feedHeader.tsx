// components/feedHeader.tsx
import { Image } from "react-native";
import { XStack } from "tamagui";
import TwoButtonSwitch from "./ui/twoButtonSwitch";
import colorsDefault from "@/constants/colors";
import { Bell } from "@tamagui/lucide-icons";

type FeedHeaderProps = {
  feedType: "forYou" | "following";
  onChangeFeedType: (type: "forYou" | "following") => void;
  // New optional props for "empty following" styling
  emptyFollowing?: boolean;
};

export default function FeedHeader({
  feedType,
  onChangeFeedType,
  emptyFollowing = false,
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
        emptyFollowing={emptyFollowing} // pass down for styling
      />

      <XStack
        width={40}
        height={40}
        borderRadius={20}
        alignItems="center"
        justifyContent="center"
        backgroundColor="rgba(255,255,255,0.12)"
      >
        <Bell size={24} color={feedType==="forYou"? colorsDefault.white:colorsDefault.bell} />
      </XStack>
    </XStack>
  );
}
