import CircleCard from "@/components/circles/CircleCard";
import CirclesIntro from "@/components/circles/CirclesIntro";
import AuthPrompt from "@/components/ui/AuthPrompt";
import colors from "@/constants/colors";
import { useResponsive } from "@/hooks/useResponsive";
import { useAuthStore } from "@/store/useAuthStore";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
} from "react-native";
import { Image, Text, XStack, YStack } from "tamagui";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CirclesScreen() {
  const { hp, wp } = useResponsive();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [circles, setCircles] = useState<any[]>([]);
  const [joinedIds, setJoinedIds] = useState<string[]>([]); // 🔥 CORE STATE
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    loadCircles();
  }, []);

  async function loadCircles() {
    const data = [
      {
        id: "1",
        title: "Faith, Work & Purpose",
        description:
          "A community where Christians discuss career, business, finding purpose in work while honoring God.",
        image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d",
        members: 120,
      },
      {
        id: "2",
        title: "Prayer & Intercession",
        description: "Believers come together to pray for one another.",
        image: "https://images.unsplash.com/photo-1519491050282-cf00c82424b4",
        members: 120,
      },
      {
        id: "3",
        title: "Bible Study & Learning",
        description: "Deep dive into scripture together.",
        image: "https://images.unsplash.com/photo-1519491050282-cf00c82424b4",
        members: 120,
      },
    ];

    setCircles(data);
  }

  /* =========================
     DERIVED STATE
  ========================= */

  const joinedCircles = useMemo(
    () => circles.filter((c) => joinedIds.includes(c.id)),
    [circles, joinedIds]
  );

  const suggestedCircles = useMemo(
    () => circles.filter((c) => !joinedIds.includes(c.id)),
    [circles, joinedIds]
  );

  /* =========================
     HANDLERS
  ========================= */

  const handleJoin = (circleId: string) => {
    setJoinedIds((prev) => [...prev, circleId]);

    // 🔥 go to about screen BEFORE feed (as per your rule)
    router.push(`/circles/about/${circleId}`);
  };

  const openCircle = (circleId: string) => {
    router.push(`/circles/${circleId}`);
  };

  /* =========================
     GUARDS
  ========================= */

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

  /* =========================
     HEADER COMPONENT
  ========================= */

  const ListHeader = () => (
    <YStack>

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
        <TextInput placeholder="Search" style={{ flex: 1 }} />
      </XStack>

      {/* 🔥 JOINED CIRCLES (ONLY IF EXISTS) */}
      {joinedCircles.length > 0 && (
        <>
          <Text
            fontWeight="600"
            fontSize={13}
            marginTop={hp(2)}
            marginBottom={hp(1)}
            paddingHorizontal={wp(5)}
          >
            My Circles
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ paddingLeft: wp(5) }}
          >
            {joinedCircles.map((circle) => (
              <Pressable
                key={circle.id}
                onPress={() => openCircle(circle.id)}
                style={{ marginRight: 12 }}
              >
                <Image
                  source={{ uri: circle.image }}
                  width={70}
                  height={70}
                  borderRadius={12}
                />
              </Pressable>
            ))}
          </ScrollView>
        </>
      )}

      {/* 🔥 TITLE CHANGES BASED ON STATE */}
      <Text
        fontWeight="600"
        fontSize={14}
        marginTop={hp(2)}
        marginBottom={hp(1)}
        paddingHorizontal={wp(5)}
      >
        {joinedCircles.length > 0 ? "Suggestions" : "All Circles"}
      </Text>
    </YStack>
  );

  /* =========================
     RENDER
  ========================= */

  return (
    <YStack flex={1} paddingTop={hp(2)} backgroundColor={colors.white}>
      <FlatList
        data={suggestedCircles}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{
          paddingHorizontal: wp(5),
          paddingBottom: hp(10),
        }}
        renderItem={({ item }) => (
          <CircleCard
            {...item}
            isJoined={joinedIds.includes(item.id)}
            onJoin={() => handleJoin(item.id)}
            onPress={() => openCircle(item.id)}
          />
        )}
      />
    </YStack>
  );
}

const styles = StyleSheet.create({
  search: {
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 12,
    fontSize: 14,
  },
});