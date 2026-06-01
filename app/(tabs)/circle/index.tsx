import CircleCard from "@/components/circles/CircleCard";
import CirclesIntro from "@/components/circles/CirclesIntro";
import AnchorCardSmall from "@/components/circles/AnchorCardSmall";
import AuthPrompt from "@/components/ui/AuthPrompt";
import colors from "@/constants/colors";
import { fetchAllCircles, fetchMyCircles, fetchCircleDetail } from "@/services/graphQL/queries/circles";
import { useResponsive } from "@/hooks/useResponsive";
import { useAuthStore } from "@/store/useAuthStore";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, XStack, YStack } from "tamagui";
import { storage } from "@/utils/storage";

const CIRCLES_CACHE_KEY = "allCircles";

export default function CirclesSuggestion() {
  const { hp, wp } = useResponsive();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [allCircles, setAllCircles] = useState<any[]>([]);
  const [myCircles, setMyCircles] = useState<any[]>([]);
  const [activeAnchors, setActiveAnchors] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [showIntro, setShowIntro] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isMounted = useRef(false);

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

      const [myData, allData] = await Promise.all([
        fetchMyCircles(),
        fetchAllCircles(),
      ]);

      const mappedMine = myData.map(mapCircle);
      const mappedAll = allData.map(mapCircle);

      setMyCircles(mappedMine);
      setAllCircles(mappedAll);
      storage.set(CIRCLES_CACHE_KEY, mappedAll);

      // Fetch active anchors for each joined circle
      if (mappedMine.length > 0) {
        const anchorResults = await Promise.allSettled(
          mappedMine.map((c: any) =>
            fetchCircleDetail(c.id).then((detail: any) => {
              if (!detail?.activeAnchor) return null;
              const expires = detail.activeAnchor.expiresAt;
              if (expires && new Date(expires).getTime() <= Date.now()) return null;
              return {
                ...detail.activeAnchor,
                circleId: c.id,
                circleName: c.title,
              };
            })
          )
        );
        const fulfilled = anchorResults.filter((r) => r.status === "fulfilled");
        const valid = fulfilled
          .filter((r) => (r as PromiseFulfilledResult<any>).value)
          .map((r) => (r as PromiseFulfilledResult<any>).value);
        setActiveAnchors(valid);
      }
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

  function handleCirclePress(circleId: string) {
    router.push({
      pathname: "/(tabs)/circle/circleFeed",
      params: { id: circleId, source: "suggestion" },
    });
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <AuthPrompt message="Login to access this feature" buttonText="Login" buttonColor={colors.primary} />
      </SafeAreaView>
    );
  }

  if (showIntro) {
    return <CirclesIntro onClose={() => setShowIntro(false)} />;
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
      </YStack>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: hp(10) }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
      >
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
                    <CircleCard {...circle} onPress={() => handleCirclePress(circle.id)} />
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
              <CircleCard key={item.id} {...item} onPress={() => handleCirclePress(item.id)} />
            ))
          )}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  search: {
    backgroundColor: "#F4F3F4",
    padding: 12,
    borderRadius: 12,
    fontSize: 14,
  },
  compactCardWrapper: {
    width: 220,
    marginRight: 10,
  },
});
