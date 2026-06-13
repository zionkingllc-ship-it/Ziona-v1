import CategoryGrid from "@/components/discover/CategoryGrid";
// import SearchHeader from "@/components/SearchHeader";
import colors from "@/constants/colors";
import { router } from "expo-router";
// import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, YStack } from "tamagui";
import { ActivityIndicator } from "react-native";

import { useDiscoverCategories } from "@/hooks/useDiscover";

export default function DiscoverScreen() {
  // const [searchQuery, setSearchQuery] = useState("");
  const { categories, loading } = useDiscoverCategories();

  const handleCategoryPress = (categoryId: string) => {
    router.push({
      pathname: "/[categoryId]",
      params: { categoryId },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={["top"]}>
      <YStack flex={1}>
        <Text fontFamily="$body" fontWeight="600" fontSize={18} paddingHorizontal={16} marginBottom={12}>
          Discover
        </Text>

        {loading ? (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <ActivityIndicator size={40} color={colors.primary}/>
          </YStack>
        ) : categories.length === 0 ? (
          <YStack flex={1} justifyContent="center" alignItems="center" paddingHorizontal={16}>
            <Text fontFamily="$body" fontWeight="400" fontSize={14} color={colors.gray}>
              No categories yet
            </Text>
            <Text fontFamily="$body" fontWeight="400" fontSize={12} color={colors.gray} marginTop={4}>
              Check back later for new categories
            </Text>
          </YStack>
        ) : (
          <CategoryGrid
            categories={categories}
            onCategoryPress={handleCategoryPress}
          />
        )}
      </YStack>
    </SafeAreaView>
  );
}