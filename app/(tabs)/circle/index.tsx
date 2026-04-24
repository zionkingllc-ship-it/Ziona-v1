import CircleCard from "@/components/circles/CircleCard";
import CirclesIntro from "@/components/circles/CirclesIntro";
import AuthPrompt from "@/components/ui/AuthPrompt";
import colors from "@/constants/colors";
import { useResponsive } from "@/hooks/useResponsive";
import { useAuthStore } from "@/store/useAuthStore";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, TextInput } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CirclesScreen() {
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
      const data = [
        {
          id: "1",
          title: "Faith, Work & Purpose",
          description:
            "A community where Christians discuss career, business, finding purpose in work while honoring God.",
          image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d",
          members: 120,
          avatars: [
            "https://images.unsplash.com/photo-1519491050282-cf00c82424b4",
            "https://images.unsplash.com/photo-1519491050282-cf00c82424b4",
            "https://images.unsplash.com/photo-1519491050282-cf00c82424b4",
          ],
        },
        {
          id: "2",
          title: "Prayer & Intercession",
          description: "Believers come together to pray for one another.",
          image: "https://images.unsplash.com/photo-1519491050282-cf00c82424b4",
          members: 120,
          avatars: [
            "https://images.unsplash.com/photo-1519491050282-cf00c82424b4",
            "https://images.unsplash.com/photo-1519491050282-cf00c82424b4",
            "https://images.unsplash.com/photo-1519491050282-cf00c82424b4",
          ],
        },
      ];

      setCircles(data);
    } catch (err) {
      console.error("Failed to load circles", err);
      setError("Failed to load circles");
    }
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
          <CircleCard
            {...item}
            onPress={() => router.push(`/circles/${item.id}`)}
          />
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
