// components/ui/TwoButtonSwitch.tsx
import colorsDefault from "@/constants/colors";
import { Button, XStack } from "tamagui";

type TwoButtonSwitchProps = {
  value: "forYou" | "following";
  onChange: (value: "forYou" | "following") => void;
  emptyFeed?: boolean;
  fontFamily?: any;
};

export default function TwoButtonSwitch({
  value,
  onChange,
  emptyFeed = false,
  fontFamily = "$body",
}: TwoButtonSwitchProps) {
  const isForYou = value === "forYou";

  const activeBg = colorsDefault.white;
  const activeText = colorsDefault.primary;
  const inactiveBg = "rgba(68, 68, 68, 0.3)";
  const inactiveText = colorsDefault.white;

  return (
    <XStack
      borderColor={"#E4C0F1"}
      borderWidth={1}
      height={"$3"}
      gap={0}
      alignSelf="center"
      justifyContent="center"
      borderRadius={999}
      flex={1}
      maxWidth={280}
    >
      <Button
        flex={1}
        height={"100%"}
        borderRadius={99}
        backgroundColor={isForYou ? activeBg : inactiveBg}
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
        flex={1}
        height={"100%"}
        borderRadius={99}
        backgroundColor={!isForYou ? activeBg : inactiveBg}
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