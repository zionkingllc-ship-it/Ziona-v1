import { ChevronRight } from "@tamagui/lucide-icons";
import { Pressable } from "react-native";
import { Text, XStack } from "tamagui";

interface Props {
  label: string;
  value: string;
  onPress: () => void;
  marginTop?: number;
}

export default function EditableFieldRow({ label, value, onPress, marginTop = 0 }: Props) {
  return (
    <Pressable onPress={onPress} style={{ marginTop }}>
      <XStack alignItems="center" backgroundColor={"#FAF9FA"} height={51} paddingHorizontal={16} borderRadius={1}>
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
