import AnchorCard from "@/components/circles/AnchorCard";
import CircleFeedBanner from "@/components/circles/CircleFeedBanner";
import CircleFeedDescription from "@/components/circles/CircleFeedDescription";
import CircleFeedFilterModal from "@/components/circles/CircleFeedFilterModal";
import CircleFeedFilterRow from "@/components/circles/CircleFeedFilterRow";
import CircleFeedItem from "@/components/circles/CircleFeedItem";
import CircleFeedProfileSection, {
  CircleFeedNameRow,
} from "@/components/circles/CircleFeedProfileSection";

import colors from "@/constants/colors";

import { fetchCircleFeed, fetchCircleDetail, fetchActiveAnchor, joinCircle, leaveCircle } from "@/services/graphQL/queries/circles";
import { joinCircle as joinCircleMutation, leaveCircle as leaveCircleMutation } from "@/services/graphQL/mutation/circles";

import { Ionicons } from "@expo/vector-icons";
import { ChevronDown } from "@tamagui/lucide-icons";

import { useLocalSearchParams, useRouter } from "expo-router";

import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  Button,
  Text,
  XStack,
  YStack,
} from "tamagui";

const HIDE_ANCHOR_THRESHOLD = 220;

export default function CircleFeedScreen() {
  const { id } =
    useLocalSearchParams<{ id: string }>();

  const router = useRouter();

  const circleId = id || "1";

  const [circle, setCircle] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCircleData();
  }, [circleId]);

  async function loadCircleData() {
    try {
      setLoading(true);
      const [circleDetail, feedData, activeAnchorData] = await Promise.all([
        fetchCircleDetail(circleId),
        fetchCircleFeed(circleId, 1, 20),
        fetchActiveAnchor(circleId),
      ]);

      if (circleDetail) {
        setCircle({
          id: circleDetail.id,
          name: circleDetail.name,
          description: circleDetail.description,
          bannerImage: circleDetail.coverImage,
          profileImage: circleDetail.coverImage,
          memberCount: circleDetail.memberCount,
          isJoined: circleDetail.isSubscribed,
          memberAvatars: circleDetail.memberPreviews?.map((m: any) => m.avatarUrl).filter(Boolean) || [],
          rules: circleDetail.rules || [],
          activeAnchor: activeAnchorData ? {
            id: activeAnchorData.id,
            type: activeAnchorData.anchorType?.toLowerCase() || "text",
            title: activeAnchorData.title,
            content: activeAnchorData.content,
            createdAt: activeAnchorData.createdAt,
            expiresAt: activeAnchorData.expiresAt,
            bibleReference: activeAnchorData.scriptureReference?.reference,
            bibleText: activeAnchorData.scriptureReference?.text,
            anchorText: activeAnchorData.content,
            backgroundImage: activeAnchorData.mediaUrl,
            likedImage: 1,
            anchorLikedCount: activeAnchorData.responseCount || 0,
            prayedCount: 0,
          } : undefined,
        });
      }

      if (feedData?.posts) {
        setPosts(feedData.posts.map((post: any) => ({
          id: post.id,
          text: post.text,
          image: post.image,
          createdAt: post.createdAt,
          likes: post.likesCount || 0,
          comments: post.commentsCount || 0,
          likedImage: 1,
          likeCount: post.likesCount || 0,
          anchorLikedCount: post.anchorLikedCount || 0,
          prayedCount: post.prayedCount || 0,
          user: {
            name: post.user?.name || "Anonymous",
            avatar: post.user?.avatarUrl || "",
          },
        })));
      }
    } catch (err: any) {
      console.error("Failed to load circle data", err);
      setError("Failed to load circle data");
    } finally {
      setLoading(false);
    }
  }

  const [showFilterModal, setShowFilterModal] =
    useState(false);

  const [filterSort, setFilterSort] =
    useState<"Trending" | "New">(
      "Trending"
    );

  const [filterView, setFilterView] =
    useState<"All" | "My post">("All");

  const [showChevron, setShowChevron] =
    useState(false);

  const [hasScrolledPastHeader, setHasScrolledPastHeader] = useState(false);

  const [showAnchorCard, setShowAnchorCard] =
    useState(true);

  const [showFixedAnchor, setShowFixedAnchor] = useState(false);
  const anchorStickyThreshold = useRef(0);
  const [anchorSectionHeight, setAnchorSectionHeight] = useState(0);
  const [anchorFilter, setAnchorFilter] = useState("Today");
  const [showAnchorDropdown, setShowAnchorDropdown] = useState(false);
  const [anchorCardVisible, setAnchorCardVisible] = useState(false);

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
          (now.getTime() - created.getTime()) / (24 * 60 * 60 * 1000)
        );
        return diffDays === daysAgo;
      });
      if (pastAnchor) return pastAnchor;
    }

    return circle.activeAnchor;
  };

  const displayAnchor = getDisplayAnchor();

  const flatListRef =
    useRef<FlatList>(null);

  /* =========================
      JOIN / LEAVE
  ========================= */

  const toggleJoin = async () => {
    try {
      const wasJoined = circle?.isJoined;
      // Optimistic update
      setCircle((prev: any) => prev ? {
        ...prev,
        isJoined: !prev.isJoined,
        memberCount: prev.isJoined
          ? prev.memberCount - 1
          : prev.memberCount + 1,
      } : null);

      if (wasJoined) {
        await leaveCircleMutation(circleId);
      } else {
        await joinCircleMutation(circleId);
      }
    } catch (err) {
      console.error("Failed to toggle join", err);
      // Revert on error
      setCircle((prev: any) => prev ? {
        ...prev,
        isJoined: !prev.isJoined,
        memberCount: prev.isJoined
          ? prev.memberCount - 1
          : prev.memberCount + 1,
      } : null);
    }
  };

  /* =========================
      SCROLL
  ========================= */

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;

    setShowChevron(scrollY > 200);

    /* COMPACT HEADER: show when scrolled past header height */
    const headerHeight = 390; // approx height of full header section
    if (scrollY >= headerHeight && !hasScrolledPastHeader) {
      setHasScrolledPastHeader(true);
    }

    /* FADE OUT compact header when near top */
    if (hasScrolledPastHeader && scrollY < 100) {
      const opacity = Math.max(0, scrollY / 100);
    }

    /* HIDE compact header only when fully at top */
    if (scrollY <= 10 && hasScrolledPastHeader) {
      setHasScrolledPastHeader(false);
    }

    /* STICKY ANCHOR: show fixed anchor when scrolled past anchor section */
    if (anchorStickyThreshold.current > 0) {
      if (scrollY >= anchorStickyThreshold.current && !showFixedAnchor) {
        setShowFixedAnchor(true);
        setAnchorCardVisible(false); // Reset anchor card visibility when sticky appears
      } else if (scrollY < anchorStickyThreshold.current && showFixedAnchor) {
        setShowFixedAnchor(false);
      }
    }

    /* HIDE ANCHOR */
    if (scrollY > HIDE_ANCHOR_THRESHOLD && showAnchorCard) {
      setShowAnchorCard(false);
    } else if (scrollY <= HIDE_ANCHOR_THRESHOLD && !showAnchorCard) {
      setShowAnchorCard(true);
    }
  };

  /* =========================
      SCROLL TOP
  ========================= */

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({
      offset: 0,
      animated: true,
    });
  };

  /* =========================
      POSTS
  ========================= */

  const renderItem = ({
    item,
  }: {
    item: CirclePost;
  }) => (
    <YStack >
      <CircleFeedItem post={item} />

      <YStack
        height={1}
        backgroundColor={colors.border}
        width={"90%"}
      />
    </YStack>
  );

  /* =========================
      EMPTY
  ========================= */

  const renderEmpty = () => (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      paddingVertical={40}
    >
      <Text
        fontFamily="$body"
        fontWeight="400"
        color={colors.gray}
      >
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
  );

  /* =========================
      RENDER
  ========================= */

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.white,
      }}
      edges={["top"]}
    >
      {/* =========================
          FIXED BANNER + COMPACT HEADER
      ========================= */}

      <View style={styles.fixedBanner}>
        <CircleFeedBanner
          bannerImage={circle.bannerImage}
          isCompact={hasScrolledPastHeader}
          circleName={circle.name}
          isJoined={circle.isJoined}
          onToggleJoin={toggleJoin}
          onBack={() => router.back()}
        />
      </View>

      {/* =========================
          FIXED ANCHOR - Shows when scrolled past anchor section
      ========================= */}

      {showFixedAnchor && displayAnchor && (
        <View style={styles.fixedAnchor}>
          <YStack paddingHorizontal={16}>
            <XStack justifyContent="space-between" alignItems="center" backgroundColor={anchorCardVisible?"#fff" : "#E4C0F180"} padding={10} borderRadius={8}>
             <Pressable onPress={()=>setAnchorCardVisible(!anchorCardVisible)}>
              <XStack alignItems="flex-start" gap={8} >
                <Ionicons name="sparkles-outline" size={16} color={colors.black} />
                <YStack>
                  <Text
                    fontFamily="$body"
                    fontWeight={'600'}
                    fontSize={13}
                    color={colors.text}
                    marginBottom={4}
                  >
                    Anchor
                  </Text>
                  <Text
                    fontFamily="$body"
                    fontWeight={'400'}
                    fontSize={13}
                    color={colors.secondaryText}
                    marginBottom={4}
                  >
                    Tap on the card to view Anchor
                  </Text>
                </YStack>
              </XStack>
              </Pressable>
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
                      fontWeight={'500'}
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
            
            {anchorCardVisible && <AnchorCard anchor={displayAnchor} />
}
            {/* FILTER ROW - sticks with anchor */}
            <CircleFeedFilterRow
              filterSort={filterSort}
              filterView={filterView}
              onPress={() => setShowFilterModal(true)}
            />
          </YStack>
        </View>
      )}

      {/* =========================
          SCROLLABLE CONTENT
      ========================= */}

      <FlatList
        ref={flatListRef}
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 129 + (showFixedAnchor ? anchorSectionHeight : 0),
          paddingBottom: 16,
        }}
        ListHeaderComponent={
          <YStack paddingHorizontal={16} bottom={30}>
            <YStack bottom={20}>
              <CircleFeedProfileSection
                circle={circle}
                onToggleJoin={toggleJoin}
              />

              <CircleFeedNameRow
                circle={circle}
                memberAvatars={circle.memberAvatars}
              />

              <CircleFeedDescription circle={circle} />
            </YStack>

            {/* ANCHOR SECTION - scrolls with content, hides when fixed version shows */}
            {displayAnchor && !showFixedAnchor && (
              <YStack onLayout={(e) => {
                // Capture the Y position relative to scroll content
                anchorStickyThreshold.current = e.nativeEvent.layout.y;
                setAnchorSectionHeight(e.nativeEvent.layout.height);
              }}>
                <XStack justifyContent="space-between" alignItems="center">
                  <XStack alignItems="flex-start" gap={8}>
                    <Ionicons name="sparkles-outline" size={16} color={colors.black} />
                    <YStack>
                      <Text
                        fontFamily="$body"
                        fontWeight={'600'}
                        fontSize={13}
                        color={colors.text}
                        marginBottom={4}
                      >
                        Anchor
                      </Text>
                      <Text
                        fontFamily="$body"
                        fontWeight={'400'}
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
                          fontWeight={'500'}
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
                <AnchorCard anchor={displayAnchor} />

                {/* FILTER ROW */}
                <CircleFeedFilterRow
                  filterSort={filterSort}
                  filterView={filterView}
                  onPress={() => setShowFilterModal(true)}
                />
              </YStack>
            )}
          </YStack>
        }
      />

      {/* =========================
          FILTER MODAL
      ========================= */}

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

      {/* =========================
          FAB
      ========================= */}

      <View style={styles.fabContainer}>
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
  fixedBanner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: colors.white,
  },

  fixedAnchor: {
    position: "absolute",
    top: 100, // banner height
    left: 0,
    right: 0,
    zIndex: 40,
    paddingTop:10,
    backgroundColor: colors.white, // opaque white background
  },


  fabContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    zIndex: 100,
  },

  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.white,
  },

  dropdownContainer: {
    position: 'absolute',
    top: 40,
    right: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingVertical: 4,
    zIndex: 100,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },

  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
