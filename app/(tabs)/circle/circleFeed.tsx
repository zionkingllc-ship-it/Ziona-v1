import AnchorCard from "@/components/circles/AnchorCard";
import CircleFeedFilterModal from "@/components/circles/CircleFeedFilterModal";
import CircleFeedItem from "@/components/circles/CircleFeedItem";
import { SimpleButton } from "@/components/ui/centerTextButton";
import colors from "@/constants/colors";
import {
  CircleFeedData,
  CirclePost,
  DEFAULT_CIRCLE_FEED,
  MOCK_CIRCLE_FEEDS,
} from "@/constants/mockCircles";
import { ChevronDown } from "@tamagui/lucide-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, Text, XStack, YStack, Button } from "tamagui";
import { Ionicons } from "@expo/vector-icons";

export default function CircleFeedScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const circleId = id || "1";
  const circleData = MOCK_CIRCLE_FEEDS[circleId] || DEFAULT_CIRCLE_FEED;

  const [circle, setCircle] = useState<CircleFeedData>(circleData);
  const [posts, setPosts] = useState<CirclePost[]>(circleData.posts || []);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterSort, setFilterSort] = useState<"Trending" | "New">("Trending");
  const [filterView, setFilterView] = useState<"All" | "My post">("All");
  const [anchorFilter, setAnchorFilter] = useState("Today");
  const [showAnchorDropdown, setShowAnchorDropdown] = useState(false);

  const anchorFilterOptions = [
    "Today",
    "Yesterday",
    "2 days ago",
    "3 days ago",
    "4 days ago",
    "5 days ago",
  ];

  const getAnchorDaysAgo = (filter: string): number => {
    if (filter === "Today") return 0;
    const match = filter.match(/(\d+) days ago/);
    return match ? parseInt(match[1]) : 0;
  };

  const getDisplayAnchor = () => {
    const daysAgo = getAnchorDaysAgo(anchorFilter);
    const now = new Date();

    if (daysAgo === 0 && circle.activeAnchor) {
      return circle.activeAnchor;
    }

    if (circle.pastAnchors && circle.pastAnchors.length > 0) {
      const pastAnchor = circle.pastAnchors.find((anchor) => {
        const created = new Date(anchor.createdAt);
        const diffDays = Math.round(
          (now.getTime() - created.getTime()) / (24 * 60 * 60 * 1000),
        );
        return diffDays === daysAgo;
      });
      if (pastAnchor) return pastAnchor;
    }

    return circle.activeAnchor;
  };

  const displayAnchor = getDisplayAnchor();

  const toggleJoin = () => {
    setCircle((prev) => ({
      ...prev,
      isJoined: !prev.isJoined,
      memberCount: prev.isJoined ? prev.memberCount - 1 : prev.memberCount + 1,
    }));
  };

  const renderItem = ({ item }: { item: CirclePost }) => (
    <YStack marginBottom={16} justifyContent="center" alignItems="center">
      <CircleFeedItem post={item} />
      <YStack height={1} backgroundColor={colors.border} width={"90%"} />
    </YStack>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.white }}
      edges={["top"]}
    >
      <Image
        source={{ uri: circle.bannerImage }}
        height={100}
        resizeMode="cover"
      />

      <YStack backgroundColor={colors.white} paddingHorizontal={16}>
        <XStack
          justifyContent="space-between"
          alignItems="center"
          marginTop={10}
        >
          <Image
            source={{ uri: circle.profileImage }}
            width={87}
            height={80}
            borderRadius={7}
          />

          <SimpleButton
            text={circle.isJoined ? "Joined" : "Join"}
            onPress={toggleJoin}
            textSize={13}
            fontFamily={"$body"}
            fontWeight={"400"}
            color={circle.isJoined ? colors.white : colors.primary}
            textColor={circle.isJoined ? colors.primary : colors.white}
            borderColor={ colors.primary }
            borderRadius={99}
            style={{ width: 90 }}
          />
        </XStack>

        <XStack
          justifyContent="space-between"
          alignItems="center"
          marginTop={10}
        >
          <Text fontFamily="$body" fontWeight="600" fontSize={16}>
            {circle.name}
          </Text>
          <YStack alignItems="center">
            {circle.memberAvatars && circle.memberAvatars.length > 0 && (
              <View style={styles.avatarStack}>
                {circle.memberAvatars.slice(0, 4).map((_, index) => (
                  <Image
                    key={index}
                    source={require("@/assets/images/profile.png")}
                    style={[styles.memberAvatar, { left: index * 12 }]}
                  />
                ))}
              </View>
            )}
            <Text
              fontFamily="$body"
              fontWeight="400"
              fontSize={8}
              color={colors.gray}
            >
              +{circle.memberCount} members
            </Text>
          </YStack>
        </XStack>

        <YStack marginTop={4} width={"100%"} justifyContent="flex-start">
          <XStack>
            <Text
              flex={1}
              fontFamily="$body"
              fontWeight="400"
              fontSize={13}
              color={colors.gray}
            >
              {circle.description.slice(0, 80)}
              {circle.description.length > 80 && "..."}
            </Text>
          </XStack>
          {circle.description.length > 10 && (
            <Text
              fontFamily="$body"
              fontWeight="500"
              fontSize={13}
              marginTop={5}
              color={colors.errorText}
              onPress={() => {
                const rulesParam = circle.rules ? JSON.stringify(circle.rules) : undefined;
                router.push({
                  pathname: "/(tabs)/circle/circleRules",
                  params: {
                    circleName: circle.name,
                    circleDescription: circle.description,
                    rules: rulesParam,
                  },
                });
              }}
            >
              More info
            </Text>
          )}
        </YStack>

        {displayAnchor && (
          <YStack top={10}>
            <XStack justifyContent="space-between" alignItems="center">
              <XStack alignItems="flex-start" gap={8}>
                <Image
                  source={require("@/assets/images/AnchorPin.png")}
                  style={{ width: 18, height: 18 }}
                />
                <YStack>
                  <Text
                    fontFamily="$body"
                    fontWeight={"600"}
                    fontSize={13}
                    color={colors.text}
                    marginBottom={4}
                  >
                    Anchor
                  </Text>
                  <Text
                    fontFamily="$body"
                    fontWeight={"400"}
                    fontSize={13}
                    color={colors.secondaryText}
                    marginBottom={4}
                  >
                    Tap on the card to view Anchor
                  </Text>
                </YStack>
              </XStack>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowAnchorDropdown(!showAnchorDropdown)}
              >
                <Text fontFamily="$body" fontSize={11} color={colors.text}>
                  {anchorFilter}
                </Text>
                <ChevronDown size={12} color={colors.text} />
              </TouchableOpacity>
            </XStack>
            {showAnchorDropdown && (
              <View style={styles.dropdownContainer}>
                {anchorFilterOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setAnchorFilter(opt);
                      setShowAnchorDropdown(false);
                    }}
                  >
                    <Text
                      fontFamily="$body"
                      fontSize={10}
                      fontWeight={"500"}
                      color={colors.text}
                    >
                      {opt}
                    </Text>
                    {opt === anchorFilter && (
                      <Text style={{ fontSize: 13 }}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {displayAnchor && <AnchorCard anchor={displayAnchor} />}
          </YStack>
        )}

        <XStack
          justifyContent="flex-start"
          alignItems="center"
          marginVertical={15}
          onPress={() => setShowFilterModal(true)}
        >
          <Image
            source={require("@/assets/images/trendingFilterIcon.png")}
            style={{ width: 24, height: 24 }}
            borderRadius={12}
          />
          <Text fontFamily="$body" fontWeight="600" fontSize={13}>
            {filterSort} {filterView !== "All" && `- ${filterView}`}
          </Text>
        </XStack>
      </YStack>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 5 }}>
        <YStack>
          {posts.length > 0 ? (
            <FlatList
              data={posts}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <YStack
              flex={1}
              justifyContent="center"
              alignItems="center"
              paddingVertical={40}
            >
              <Text fontFamily="$body" fontWeight="400" color={colors.gray}>
                No posts yet
              </Text>
              <Text
                fontFamily="$body"
                fontWeight="400"
                fontSize={12}
                color={colors.gray}
                marginTop={4}
              >
                Be the first to post in this circle!
              </Text>
            </YStack>
          )}
        </YStack>
      </ScrollView>

      <CircleFeedFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        sort={filterSort}
        setSort={(v) => {
          setFilterSort(v);
          setShowFilterModal(false);
        }}
        view={filterView}
        setView={(v) => {
          setFilterView(v);
          setShowFilterModal(false);
        }}
      />

      {/* FAB - Create Post / Reflection */}
      <View
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          zIndex: 100,
        }}
      >
        <Button
          circular
          size="$6"
          backgroundColor={colors.primary}
          onPress={() => {
            router.push({
              pathname: "/CircleExtension/CircleCommentComposer",
              params: { circleId: circleId },
            });
          }}
          elevation={4}
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.2}
          shadowRadius={4}
        >
          <Ionicons name="add" size={28} color="#FFF" />
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avatarStack: {
    width: 60,
    height: 24,
  },
  memberAvatar: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.white,
  },
  dropdownContainer: {
    position: "absolute",
    top: 40,
    right: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingVertical: 4,
    zIndex: 100,
    minWidth: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
