import CategoryGrid from "@/components/discover/CategoryGrid";
import DiscoverSearchResults from "@/components/discover/SearchResults";
import SearchHeader from "@/components/SearchHeader";
import colors from "@/constants/colors";
import { useDiscoverCategories, useDiscoverSearch } from "@/hooks/useDiscover";
import { router } from "expo-router";
import { useCallback, useState, useEffect } from "react";
import { RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, YStack } from "tamagui";

export default function DiscoverScreen() {
  const { categories, loading, refetch } = useDiscoverCategories();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const {
    creators,
    posts,
    creatorCount,
    postCount,
    isLoading: searchLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDiscoverSearch(debouncedSearch);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch {
      console.warn("[discover] refresh failed");
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleCategoryPress = (
    categoryId: string,
    categoryLabel?: string,
    categorySlug?: string,
  ) => {
    router.push({
      pathname: "/[categoryId]",
      params: { categoryId, label: categoryLabel, slug: categorySlug },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={["top"]}>
      <YStack flex={1}>
        <Text fontFamily="$body" fontWeight="600" fontSize={18} paddingHorizontal={16} marginBottom={12}>
          Discover
        </Text>

        <SearchHeader
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search users and content"
        />

        {searchQuery.trim() ? (
          <DiscoverSearchResults
            creators={creators}
            posts={posts}
            creatorCount={creatorCount}
            postCount={postCount}
            isLoading={searchLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            onFetchNextPage={fetchNextPage}
          />
        ) : loading ? (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <Text fontFamily="$body" fontWeight="400" fontSize={14} color={colors.gray}>Loading categories...</Text>
          </YStack>
        ) : categories.length === 0 ? (
          <YStack flex={1} justifyContent="center" alignItems="center" paddingHorizontal={16}>
            <Text fontFamily="$body" fontWeight="400" fontSize={14} color={colors.gray}>No categories yet</Text>
            <Text fontFamily="$body" fontWeight="400" fontSize={12} color={colors.gray} marginTop={4}>Check back later for new categories</Text>
          </YStack>
        ) : (
          <CategoryGrid
            categories={categories}
            onCategoryPress={(id, label, slug) => handleCategoryPress(id, label, slug)}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}
      </YStack>
    </SafeAreaView>
  );
}