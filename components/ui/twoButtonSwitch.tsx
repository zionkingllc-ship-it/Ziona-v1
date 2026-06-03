// components/ui/TwoButtonSwitch.tsx
import colorsDefault from "@/constants/colors";
import { Button, XStack } from "tamagui";

type TwoButtonSwitchProps = {
  value: "forYou" | "following";
  onChange: (value: "forYou" | "following") => void;
  width: number | string;
  emptyFeed?: boolean;
  fontFamily?: any;
};

export default function TwoButtonSwitch({
  value,
  onChange,
  width,
  emptyFeed = false,
  fontFamily = "$body",
}: TwoButtonSwitchProps) {
  const isForYou = value === "forYou";

  const activeBg = emptyFeed ? colorsDefault.primary : colorsDefault.white;
  const activeText = emptyFeed
    ? colorsDefault.white
    : colorsDefault.primary;
  const inactiveText = emptyFeed
    ? colorsDefault.primary
    : colorsDefault.white;

  return (
    <XStack
      borderColor={"#E4C0F1"}
      borderWidth={1}
      height={"$3"}
      gap="$2"
      alignSelf="center"
      justifyContent="center"
      borderRadius={999}
      width={width}
    >
      <Button
        width={"50%"}
        height={"100%"}
        borderRadius={99}
        backgroundColor={isForYou ? activeBg : "transparent"}
        borderColor={isForYou ? "#E4C0F1" : "transparent"}
        color={isForYou ? activeText : inactiveText}
        fontSize={13}
        fontFamily={fontFamily}
        fontWeight={"500"}
        onPress={() => onChange("forYou")}
        shadowColor="#2b2a2a"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.05}
        shadowRadius={2}
        elevation={2}
      >
        For You
      </Button>

      <Button
        width={"50%"}
        height={"100%"}
        borderRadius={99}
        backgroundColor={!isForYou ? activeBg : "transparent"}
        borderColor={!isForYou ? "#E4C0F1" : "transparent"}
        color={!isForYou ? activeText : inactiveText}
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.1}
        shadowRadius={4}
        elevation={3}
        fontSize={13}
        fontWeight={"500"}
        fontFamily={fontFamily}
        onPress={() => onChange("following")}
      >
        Following
      </Button>
    </XStack>
  );
}
