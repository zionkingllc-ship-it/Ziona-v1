import CategoryCard from "./CategoryCard";
import { DiscoverCategory } from "@/types/discover";
import { FlatList } from "react-native";

type Props = {
  categories: DiscoverCategory[];
  onCategoryPress: (id: string) => void;
};

export default function CategoryGrid({ categories, onCategoryPress }: Props) {
  return (
    <FlatList
      data={categories}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={{ paddingHorizontal: 8 }}
      renderItem={({ item }) => (
        <CategoryCard
          category={item}
          onPress={() => onCategoryPress(item.id)}
        />
      )}
      showsVerticalScrollIndicator={false}
    />
  );
}