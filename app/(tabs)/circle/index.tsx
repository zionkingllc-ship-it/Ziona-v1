import CircleCard from "@/components/circles/CircleCard";
import CirclesIntro from "@/components/circles/CirclesIntro";
import AuthPrompt from "@/components/ui/AuthPrompt";
import colors from "@/constants/colors";
import { MOCK_CIRCLES } from "@/constants/mockCircles";
import { useResponsive } from "@/hooks/useResponsive";
import { useAuthStore } from "@/store/useAuthStore";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, XStack, YStack } from "tamagui";

export default function CirclesSuggestion() {
  const { hp, wp } = useResponsive();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [circles, setCircles] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    loadCircles();
  }, []);

  async function loadCircles() {
    try {
      // Show all circles to test different anchor backgrounds
      const data = MOCK_CIRCLES;

      setCircles(data);
    } catch (err) {
      console.error("Failed to load circles", err);
      setError("Failed to load circles");
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

  return (
    <YStack flex={1} paddingTop={hp(6)} backgroundColor={colors.white}>
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
        contentContainerStyle={{
          paddingHorizontal: wp(5),
          paddingBottom: hp(10),
        }}
        renderItem={({ item }) => (
          <CircleCard {...item} onPress={() => handleCirclePress(item.id)} />
        )}
      />
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
