import { ChevronRight } from "@tamagui/lucide-icons";
import { Pressable } from "react-native";
import { Text, XStack } from "tamagui";

interface Props {
  label: string;
  value: string;
  onPress: () => void;
}

export default function EditableFieldRow({ label, value, onPress }: Props) {
  return (
    <Pressable onPress={onPress}>
      <XStack alignItems="center" backgroundColor={"#FAF9FA"} paddingVertical={12} paddingHorizontal={16} borderRadius={16}>
        <Text fontFamily="$body" fontSize={16} fontWeight="400" width="30%">{label}</Text>
        <Text
          fontFamily="$body"
          fontSize={16}
          fontWeight="500"
          color="$gray"
          flex={1}  
          marginLeft={20} 
          numberOfLines={1}
        >{value}</Text>
        <ChevronRight size={22} color="#444" />
      </XStack>
    </Pressable>
  );
}
