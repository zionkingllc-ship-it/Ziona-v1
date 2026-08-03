import CategoryCard from "./CategoryCard";
import { DiscoverCategory } from "@/types/discover";
import { FlatList, RefreshControl } from "react-native";
import React from "react";

type Props = {
  categories: DiscoverCategory[];
  onCategoryPress: (id: string, label?: string, slug?: string) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export default function CategoryGrid({ categories, onCategoryPress, refreshing, onRefresh }: Props) {
  return (
    <FlatList
      data={categories}
      keyExtractor={(item) => item.id}
      numColumns={2}
      windowSize={5}
      maxToRenderPerBatch={10}
      contentContainerStyle={{ paddingHorizontal: 8 }}
      renderItem={({ item }) => (
        <CategoryCard
          category={item}
          onPress={() => onCategoryPress(item.id, item.label, item.slug)}
        />
      )}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshing !== undefined && onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined}
    />
  );
}