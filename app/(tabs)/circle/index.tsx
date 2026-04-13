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

export default function CirclesScreen() {
  const { hp, wp } = useResponsive();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [circles, setCircles] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [showIntro, setShowIntro] = useState(true);
  const [ready, setReady] = useState(false);

  if (!isAuthenticated) {
    return (
      <YStack
        style={{ justifyContent: "center", alignItems: "center" }}
        flex={1}
        backgroundColor={colors.white}
      >
        <AuthPrompt
          message="Login to create a post"
          buttonText="Login"
          buttonColor={colors.primary}
        />
      </YStack>
    );
  }

  /* =========================
     TEMP DATA (replace with backend)
  ========================= */

  useEffect(() => {
    loadCircles();
  }, []);

  async function loadCircles() {
    try {
      // TODO: replace with discoverFeed / API
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

  if (showIntro) {
    return <CirclesIntro onClose={() => setShowIntro(false)} />;
  }

  return (
    <YStack flex={1} paddingTop={hp(6)} backgroundColor={colors.white}>
      {/* SEARCH */}
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

      {/* TITLE */}
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

      {/* LIST */}
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
