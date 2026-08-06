import CircleCard from "@/components/circles/CircleCard";
import CirclesIntro from "@/components/circles/CirclesIntro";
import AnchorCardSmall from "@/components/circles/AnchorCardSmall";
import colors from "@/constants/colors";
import { fetchAllCircles, fetchMyCircles } from "@/services/graphQL/queries/circles";
import { useResponsive } from "@/hooks/useResponsive";
import { useCircleStore } from "@/store/circleStore";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, XStack, YStack } from "tamagui";
import { storage } from "@/utils/storage";
import { getViewedStatus } from "@/utils/viewedAnchors";

const CIRCLES_CACHE_KEY = "allCircles";

export default function CirclesSuggestion() {
  const { hp, wp } = useResponsive();
  const hasSeenIntro = useCircleStore((s) => s.hasSeenIntro);
  const setSeenIntro = useCircleStore((s) => s.setSeenIntro);

  const [allCircles, setAllCircles] = useState<any[]>([]);
  const [myCircles, setMyCircles] = useState<any[]>([]);
  const [activeAnchors, setActiveAnchors] = useState<any[]>([]);
  const [viewedAnchors, setViewedAnchors] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [hasHydrated, setHasHydrated] = useState(useCircleStore.persist.hasHydrated());
  const showIntro = hasHydrated && !hasSeenIntro;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");

  const isMounted = useRef(false);

  useEffect(() => {
    if (hasHydrated) return;
    const unsub = useCircleStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });
    if (useCircleStore.persist.hasHydrated()) {
      setHasHydrated(true);
    }
    return unsub;
  }, [hasHydrated]);

  useFocusEffect(
    useCallback(() => {
      if (!isMounted.current) {
        loadCachedCircles();
        isMounted.current = true;
      }
      loadAllData();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  }, []);

  async function loadCachedCircles() {
    const cached = await storage.get<any[]>(CIRCLES_CACHE_KEY);
    if (cached && cached.length > 0) {
      setAllCircles(cached);
      setLoading(false);
    }
  }

  const mapCircle = useCallback((circle: any) => {
    return {
      id: circle.id,
      title: circle.name,
      description: circle.description,
      image: circle.coverImage,
      members: circle.memberCount,
      isJoined: circle.isSubscribed,
      avatars: circle.avatars || [],
    };
  }, []);

  async function loadAllData() {
    try {
      setLoading(true);

      const [myResult, allResult] = await Promise.allSettled([
        fetchMyCircles(),
        fetchAllCircles(),
      ]);

      const mappedMine = (myResult.status === "fulfilled" ? myResult.value : [])
        .map(mapCircle);
      const mappedAll = (allResult.status === "fulfilled" ? allResult.value : [])
        .map(mapCircle);

      setMyCircles(mappedMine);
      setAllCircles(mappedAll);
      storage.set(CIRCLES_CACHE_KEY, mappedAll);

      // Extract active anchors from myCircles response
      const anchors = (myResult.status === "fulfilled" ? myResult.value : [])
        .map((circle: any) => {
          if (!circle?.activeAnchor) return null;
          const createdAt = circle.activeAnchor.createdAt;
          if (createdAt) {
            const daysOld = Math.round((Date.now() - new Date(createdAt).getTime()) / (24 * 60 * 60 * 1000));
            if (daysOld > 5) return null;
          }
          return {
            ...circle.activeAnchor,
            circleId: circle.id,
            circleName: circle.name,
          };
        })
        .filter(Boolean);
      setActiveAnchors(anchors);
      getViewedStatus(anchors.map((a: any) => a.id)).then(setViewedAnchors).catch(() => {});
    } catch (err) {
      console.error("Failed to load circles", err);
      setError("Failed to load circles");
    } finally {
      setLoading(false);
    }
  }

  const joinedIds = useMemo(() => new Set(myCircles.map((c) => c.id)), [myCircles]);
  const suggestedCircles = useMemo(
    () => allCircles.filter((c) => !joinedIds.has(c.id)),
    [allCircles, joinedIds]
  );

  const searchResults = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return [];
    const pool = new Map<string, any>();
    [...myCircles, ...suggestedCircles].forEach((c) => pool.set(c.id, c));
    return Array.from(pool.values()).filter(
      (c) =>
        (c.title || "").toLowerCase().includes(query) ||
        (c.description || "").toLowerCase().includes(query)
    );
  }, [myCircles, suggestedCircles, searchText]);

  function handleCirclePress(circle: any) {
    router.push({
      pathname: "/circleFeed",
      params: {
        id: circle.id,
        source: "suggestion",
        _name: circle.title,
        _desc: circle.description,
        _image: circle.image,
        _members: String(circle.members),
        _avatars: JSON.stringify(circle.avatars),
      },
    });
  }

  if (showIntro) {
    return (
      <CirclesIntro
        onClose={() => {
          setSeenIntro();
        }}
      />
    );
  }

  const renderEmptyState = () => (
    <YStack flex={1} justifyContent="center" alignItems="center" paddingVertical={hp(10)}>
      {error ? (
        <>
          <Ionicons name="cloud-offline-outline" size={40} color={colors.gray} />
          <Text fontFamily="$body" fontWeight="400" fontSize={16} color={colors.gray} marginTop={hp(1)} marginBottom={hp(1)} textAlign="center" paddingHorizontal={wp(10)}>
            {error}
          </Text>
          <TouchableOpacity onPress={loadAllData} style={{ marginTop: hp(2) }}>
            <XStack gap={6} alignItems="center">
              <Ionicons name="refresh" size={16} color={colors.primary} />
              <Text fontFamily="$body" fontWeight="500" fontSize={14} color={colors.primary}>
                Tap to retry
              </Text>
            </XStack>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text fontFamily="$body" fontWeight="400" fontSize={16} color={colors.gray} marginBottom={hp(1)}>
            No suggested circles at the moment
          </Text>
          <Text fontFamily="$body" fontWeight="400" fontSize={12} color={colors.gray}>
            Check back later for new circles to join
          </Text>
        </>
      )}
    </YStack>
  );

  if (loading) {
    return (
      <YStack flex={1} paddingTop={hp(6)} backgroundColor={colors.white}>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator color={colors.primary} size="large" />
          <Text fontFamily="$body" fontSize={14} color={colors.gray} marginTop={12}>
            Loading circles...
          </Text>
        </YStack>
      </YStack>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={["top"]}>
      <YStack paddingHorizontal={wp(5)} paddingTop={hp(2)}>
        <Text fontFamily="$body" fontWeight="600" fontSize={18}>
          Circles
        </Text>
        <XStack
          alignItems="center"
          marginTop={hp(1.5)}
          borderWidth={1}
          borderColor={colors.border}
          backgroundColor="#F4F3F4"
          borderRadius={12}
          paddingLeft={12}
        >
          <Ionicons name="search" size={16} color={colors.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search circles by name or keyword"
            placeholderTextColor={colors.placeholderText}
            value={searchText}
            onChangeText={setSearchText}
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")} hitSlop={8} style={{ paddingRight: 12 }}>
              <Ionicons name="close-circle" size={16} color={colors.gray} />
            </TouchableOpacity>
          )}
        </XStack>
      </YStack>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: hp(10) }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
      >
        {searchText.trim() ? (
          <YStack paddingHorizontal={wp(5)}>
            <Text fontFamily="$body" fontWeight="600" fontSize={14} marginTop={hp(2)} marginBottom={hp(1)}>
              {searchResults.length > 0 ? "Search Results" : "No results"}
            </Text>
            {searchResults.length === 0 ? (
              <YStack flex={1} justifyContent="center" alignItems="center" paddingVertical={hp(10)}>
                <Ionicons name="search-outline" size={40} color={colors.gray} />
                <Text fontFamily="$body" fontWeight="400" fontSize={16} color={colors.gray} marginTop={hp(1)} textAlign="center" paddingHorizontal={wp(10)}>
                  No circles found for &ldquo;{searchText.trim()}&rdquo;
                </Text>
              </YStack>
            ) : (
              searchResults.map((item: any) => (
                <CircleCard key={item.id} {...item} onPress={() => handleCirclePress(item)} />
              ))
            )}
          </YStack>
        ) : (
          <YStack paddingHorizontal={wp(5)}>
            {/* ANCHOR OF THE DAY */}
            {activeAnchors.length > 0 && (
              <YStack marginTop={hp(2)}>
                <Text fontFamily="$body" fontWeight="600" fontSize={14} marginBottom={hp(1)}>
                  Anchor of the Day
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {activeAnchors.map((anchor: any) => (
                    <AnchorCardSmall
                      key={anchor.id}
                      anchor={anchor}
                      circleId={anchor.circleId}
                      circleName={anchor.circleName}
                      viewed={viewedAnchors[anchor.id]}
                    />
                  ))}
                </ScrollView>
              </YStack>
            )}

            {/* MY CIRCLES */}
            {myCircles.length > 0 && (
              <YStack marginTop={hp(2)}>
                <Text fontFamily="$body" fontWeight="600" fontSize={14} marginBottom={hp(1)}>
                  My Circles
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {myCircles.map((circle: any) => (
                    <View key={circle.id} style={styles.compactCardWrapper}>
                      <CircleCard {...circle} onPress={() => handleCirclePress(circle)} />
                    </View>
                  ))}
                </ScrollView>
              </YStack>
            )}

            {/* SUGGESTED CIRCLES */}
            <Text fontFamily="$body" fontWeight="600" fontSize={14} marginTop={hp(2)} marginBottom={hp(1)}>
              Suggested Circles
            </Text>

            {suggestedCircles.length === 0 ? (
              renderEmptyState()
            ) : (
              suggestedCircles.map((item: any) => (
                <CircleCard key={item.id} {...item} onPress={() => handleCirclePress(item)} />
              ))
            )}
          </YStack>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  compactCardWrapper: {
    width: 220,
    marginRight: 10,
  },
});
