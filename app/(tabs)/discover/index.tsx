import CategoryGrid from "@/components/discover/CategoryGrid";
import colors from "@/constants/colors";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, YStack } from "tamagui";
import { ActivityIndicator } from "react-native";

import { useDiscoverCategories } from "@/hooks/useDiscover";
import { useState, useCallback } from "react";

export default function DiscoverScreen() {
  const { categories, loading, refetch } = useDiscoverCategories();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch { console.warn("[discover] refresh failed"); } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleCategoryPress = (categoryId: string, categoryLabel?: string) => {
    router.push({
      pathname: "/[categoryId]",
      params: { categoryId, label: categoryLabel },
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
            onCategoryPress={(id, label) => handleCategoryPress(id, label)}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}
      </YStack>
    </SafeAreaView>
  );
}