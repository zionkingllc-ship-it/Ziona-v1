import { DiscoverCategory } from "@/types/discover";
import { Image, TouchableOpacity } from "react-native";
import { Text } from "tamagui";

type Props = {
  category: DiscoverCategory;
  onPress: () => void;
};

export default function CategoryCard({ category, onPress }: Props) {
  return (
    <TouchableOpacity
      style={{
        flex: 1,
        flexDirection: "row",
        margin: 8,
        height: 100,
        borderRadius: 12,
        backgroundColor: category.bgColor,
        borderColor: category.bdColor,
        borderWidth: 1,
        paddingTop: 20,
        justifyContent: "space-between",
        paddingHorizontal: 15,
      }}
      onPress={onPress}
    >
      <Text fontWeight="600" fontFamily="$heading" fontSize={20}>
        {category.label}
      </Text>
 
      <Image
        source={
          typeof category.icon === "string"
            ? { uri: category.icon }
            : category.icon
        }
        resizeMode="contain"
        style={{ width: 50, height: 50, marginBottom: 8 }}
      />
    </TouchableOpacity>
  );
}