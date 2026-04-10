import colors from "@/constants/colors";
import { TouchableOpacity } from "react-native";
import { Text, XStack } from "tamagui";

const FILTERS = ["all", "images", "video", "text"] as const;

type Props = {
  selected: string;
  onSelect: (filter: any) => void;
};

export default function PostFilters({ selected, onSelect }: Props) {
  return (
    <XStack style={{ paddingHorizontal: 16, marginBottom: 12 }} gap="$2">
      {FILTERS.map((f) => (
        <TouchableOpacity
          key={f}
          onPress={() => onSelect(f)}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 6,
            borderRadius: 6,
            borderWidth: 1,
            backgroundColor: selected === f ? "#181419" : "#f0f0f0",
            borderColor: selected === f ? "#181419" : "#EEEBEF",
          }}
        >
          <Text
            fontFamily="$body"
            style={{
              color: selected === f ? colors.white : "#4E4252",
              fontWeight: "600",
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </XStack>
  );
}