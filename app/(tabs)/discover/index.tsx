import CategoryGrid from "@/components/discover/CategoryGrid";
import SearchHeader from "@/components/SearchHeader";
import colors from "@/constants/colors";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, XStack, YStack } from "tamagui";
import { ActivityIndicator, FlatList } from "react-native";
import { View } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useDiscoverCategories } from "@/hooks/useDiscover";
import { useFriendsList } from "@/hooks/useFollow";

export default function DiscoverScreen() {
  const { categories, loading, refetch } = useDiscoverCategories();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults, isLoading: searchLoading } = useFriendsList(debouncedSearch || undefined);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch { console.warn("[discover] refresh failed"); } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleCategoryPress = (categoryId: string, categoryLabel?: string, categorySlug?: string) => {
    router.push({
      pathname: "/[categoryId]",
      params: { categoryId, label: categoryLabel, slug: categorySlug },
    });
  };

  const renderUserResult = ({ item }: { item: any }) => {
    const initials = item.username?.[0]?.toUpperCase() ?? "?";
    return (
      <XStack alignItems="center" gap="$3" paddingHorizontal={16} paddingVertical={10} borderBottomWidth={1} borderColor={colors.border}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.gray, justifyContent: "center", alignItems: "center" }}>
          <Text color={colors.white} fontSize={14} fontWeight="600">{initials}</Text>
        </View>
        <View>
          <Text fontFamily="$body" fontWeight="600" fontSize={15} color={colors.text}>{item.username}</Text>
          {item.fullName ? (
            <Text fontFamily="$body" fontWeight="400" fontSize={13} color={colors.gray}>{item.fullName}</Text>
          ) : null}
        </View>
      </XStack>
    );
  };

  const renderSearchResults = () => {
    if (searchLoading) {
      return (
        <YStack flex={1} justifyContent="center" alignItems="center" paddingTop={20}>
          <ActivityIndicator size="large" color={colors.primary} />
        </YStack>
      );
    }

    if (!searchResults || searchResults.length === 0) {
      return (
        <YStack flex={1} justifyContent="center" alignItems="center" paddingHorizontal={16} paddingTop={40}>
          <Text fontFamily="$body" fontWeight="400" fontSize={14} color={colors.gray}>No users found</Text>
        </YStack>
      );
    }

    return (
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id}
        renderItem={renderUserResult}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    );
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
          placeholder="Search users"
        />

        {searchQuery.trim() ? (
          renderSearchResults()
        ) : loading ? (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <ActivityIndicator size={40} color={colors.primary}/>
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