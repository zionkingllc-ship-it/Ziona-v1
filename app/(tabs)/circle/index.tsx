import CircleCard from "@/components/circles/CircleCard";
import CirclesIntro from "@/components/circles/CirclesIntro";
import AuthPrompt from "@/components/ui/AuthPrompt";
import colors from "@/constants/colors";
import { fetchAllCircles, fetchMyCircles, fetchSuggestedCircles } from "@/services/graphQL/queries/circles";
import { useResponsive } from "@/hooks/useResponsive";
import { useAuthStore } from "@/store/useAuthStore";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, XStack, YStack } from "tamagui";
import { storage } from "@/utils/storage";

const CIRCLES_CACHE_KEY = "allCircles";

export default function CirclesSuggestion() {
  const { hp, wp } = useResponsive();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [circles, setCircles] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [showIntro, setShowIntro] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCircles();
    loadCachedCircles();
  }, []);

  async function loadCachedCircles() {
    const cached = await storage.get<any[]>(CIRCLES_CACHE_KEY);
    if (cached && cached.length > 0) {
      setCircles(cached);
      setLoading(false);
    }
  }

  async function loadCircles() {
    try {
      setLoading(true);
      const data = await fetchAllCircles();

      // Map backend fields to UI expectations
      const mappedCircles = data.map((circle: any) => ({
        id: circle.id,
        title: circle.name,
        description: circle.description,
        image: circle.coverImage,
        members: circle.memberCount,
        isJoined: circle.isSubscribed,
        avatars: circle.avatars || [],
      }));

      setCircles(mappedCircles);
      storage.set(CIRCLES_CACHE_KEY, mappedCircles);
    } catch (err) {
      console.error("Failed to load circles", err);
      setError("Failed to load circles");
    } finally {
      setLoading(false);
    }
  }

  async function handleCirclePress(circleId: string) {
    // Navigate to circle feed with circle ID
    router.push({
      pathname: "/(tabs)/circle/circleFeed",
      params: { id: circleId },
    });
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <AuthPrompt
          message="Login to access this feature"
          buttonText="Login"
          buttonColor={colors.primary}
        />
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
          <Text
            fontFamily="$body"
            fontWeight="400"
            fontSize={16}
            color={colors.gray}
            marginTop={hp(1)}
            marginBottom={hp(1)}
            textAlign="center"
            paddingHorizontal={wp(10)}
          >
            {error}
          </Text>
          <TouchableOpacity onPress={loadCircles} style={{ marginTop: hp(2) }}>
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
          <Text
            fontFamily="$body"
            fontWeight="400"
            fontSize={16}
            color={colors.gray}
            marginBottom={hp(1)}
          >
            No suggested circles at the moment
          </Text>
          <Text
            fontFamily="$body"
            fontWeight="400"
            fontSize={12}
            color={colors.gray}
          >
            Check back later for new circles to join
          </Text>
        </>
      )}
    </YStack>
  );

  return (
    <YStack flex={1} paddingTop={hp(6)} backgroundColor={colors.white}>
      {loading ? (
        <YStack flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator color={colors.primary} size="large" />
          <Text fontFamily="$body" fontSize={14} color={colors.gray} marginTop={12}>
            Loading circles...
          </Text>
        </YStack>
      ) : circles.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <XStack
            style={[
              styles.search,
              {
                backgroundColor: colors.borderBackground,
                borderColor: colors.border,
              },
            ]}
          >
            <TextInput placeholder="Search" />
          </XStack>

          <Text
            fontFamily="$body"
            fontWeight="600"
            fontSize={14}
            marginTop={hp(2)}
            marginBottom={hp(1)}
            paddingHorizontal={wp(5)}
          >
            All Circles
          </Text>

          <FlatList
            data={circles}
            keyExtractor={(item) => item.id}
            windowSize={5}
            maxToRenderPerBatch={10}
            removeClippedSubviews={true}
            contentContainerStyle={{
              paddingHorizontal: wp(5),
              paddingBottom: hp(10),
            }}
            renderItem={({ item }) => (
              <CircleCard {...item} onPress={() => handleCirclePress(item.id)} />
            )}
          />
        </>
      )}
    </YStack>
  );
}

const styles = StyleSheet.create({
  search: {
    backgroundColor: "#F4F3F4",
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 12,
    fontSize: 14,
  },
});
