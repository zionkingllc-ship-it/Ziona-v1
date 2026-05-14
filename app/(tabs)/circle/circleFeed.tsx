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

import {
  CircleFeedData,
  DEFAULT_CIRCLE_FEED,
  MOCK_CIRCLE_FEEDS,
} from "@/constants/mockCircles";

import { fetchCircleFeedData } from "@/services/graphQL/queries/circles";
import { joinCircle as joinCircleMutation, leaveCircle as leaveCircleMutation } from "@/services/graphQL/mutation/circles";

import { Ionicons } from "@expo/vector-icons";
import { ChevronDown } from "@tamagui/lucide-icons";

import { useLocalSearchParams, useRouter } from "expo-router";

import React, { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
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

import { storage } from "@/utils/storage";

const CACHE_KEY = "circleFeed";

const HIDE_ANCHOR_THRESHOLD = 220;

type CirclePost = {
  id: string;
  text?: string;
  image?: string;
  createdAt: string;
  likes: number;
  comments: number;
  likedImage?: number;
  likeCount?: number;
  anchorLikedCount?: number;
  prayedCount?: number;
  user: {
    name: string;
    avatar: string;
  };
};

export default function CircleFeedScreen() {
  const { id, t } =
    useLocalSearchParams<{ id: string; t?: string }>();

  const router = useRouter();

  const circleId = id || "1";

  const circleData =
    MOCK_CIRCLE_FEEDS[circleId] ||
    DEFAULT_CIRCLE_FEED;

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [circle, setCircle] =
    useState<CircleFeedData>(circleData);

  const [posts, setPosts] = useState<CirclePost[]>(
    circleData.posts || []
  );

  const cacheKey = `${CACHE_KEY}_${circleId}`;

  useEffect(() => {
    let mounted = true;

    const loadCached = async () => {
      const cached = await storage.get<{ circle: CircleFeedData; posts: CirclePost[] }>(cacheKey);
      if (!mounted || !cached) return;
      setCircle(cached.circle);
      setPosts(cached.posts);
      setLoading(false);
    };

    const loadData = async () => {
      setApiError(null);
      try {
        const data = await fetchCircleFeedData(circleId, 10, 1, 20);
        if (!mounted) return;

        if (data) {
          const mappedCircle: CircleFeedData = {
            bannerImage: data.bannerImage || circleData.bannerImage,
            profileImage: data.profileImage || circleData.profileImage,
            name: data.name || circleData.name,
            description: data.description || circleData.description,
            memberCount: data.memberCount ?? circleData.memberCount,
            isJoined: data.isJoined ?? circleData.isJoined,
            activeAnchor: data.activeAnchor
              ? {
                  id: data.activeAnchor.id,
                  type: data.activeAnchor.anchorType as "text" | "image" | "video",
                  title: data.activeAnchor.title,
                  content: data.activeAnchor.content,
                  scripture: data.activeAnchor.scripture || undefined,
                  likedImage: data.activeAnchor.likedImage || undefined,
                  anchorLikedCount: data.activeAnchor.anchorLikedCount,
                  anchorVerse: data.activeAnchor.anchorVerse || undefined,
                  anchorText: data.activeAnchor.anchorText || undefined,
                  anchorImage: data.activeAnchor.anchorImage || undefined,
                  anchorVideo: data.activeAnchor.anchorVideo || undefined,
                  anchorThumbnail: data.activeAnchor.anchorThumbnail || undefined,
                  bibleReference: data.activeAnchor.bibleReference || undefined,
                  bibleText: data.activeAnchor.bibleText || undefined,
                  backgroundColors: data.activeAnchor.backgroundColors as [string, string] | undefined,
                  backgroundImage: data.activeAnchor.backgroundImage || undefined,
                  prayedCount: data.activeAnchor.prayedCount || undefined,
                  createdAt: data.activeAnchor.createdAt,
                  expiresAt: data.activeAnchor.expiresAt || undefined,
                }
              : circleData.activeAnchor,
            pastAnchors: data.pastAnchors
              ? data.pastAnchors.map((a: any) => ({
                  id: a.id,
                  type: a.anchorType as "text" | "image" | "video",
                  title: a.title,
                  content: a.content,
                  scripture: a.scripture || undefined,
                  likedImage: a.likedImage || undefined,
                  anchorLikedCount: a.anchorLikedCount,
                  anchorVerse: a.anchorVerse || undefined,
                  anchorText: a.anchorText || undefined,
                  anchorImage: a.anchorImage || undefined,
                  anchorVideo: a.anchorVideo || undefined,
                  anchorThumbnail: a.anchorThumbnail || undefined,
                  bibleReference: a.bibleReference || undefined,
                  bibleText: a.bibleText || undefined,
                  backgroundColors: a.backgroundColors as [string, string] | undefined,
                  backgroundImage: a.backgroundImage || undefined,
                  prayedCount: a.prayedCount || undefined,
                  createdAt: a.createdAt,
                  expiresAt: a.expiresAt || undefined,
                }))
              : circleData.pastAnchors,
            posts: data.posts
              ? data.posts.map((p: any) => ({
                  id: p.id,
                  text: p.text || undefined,
                  image: p.image || undefined,
                  createdAt: p.createdAt,
                  likes: p.likes,
                  comments: p.comments,
                  likedImage: p.likedImage || undefined,
                  likeCount: p.likeCount,
                  anchorLikedCount: p.anchorLikedCount,
                  prayedCount: p.prayedCount,
                  user: {
                    name: p.user.name || "",
                    avatar: p.user.avatar || "",
                  },
                }))
              : circleData.posts,
            memberAvatars: data.memberAvatars || circleData.memberAvatars,
            rules: data.rules
              ? data.rules.map((r: any) => ({
                  id: r.ruleNumber,
                  title: r.title,
                  description: r.description,
                }))
              : circleData.rules,
          };
          setCircle(mappedCircle);
          setPosts(mappedCircle.posts);
          storage.set(cacheKey, { circle: mappedCircle, posts: mappedCircle.posts });
        }
      } catch (err) {
        console.error("Failed to load circle feed:", err);
        if (mounted) {
          setApiError("Failed to load. Using cached data.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCached();
    loadData();

    return () => {
      mounted = false;
    };
  }, [circleId]);

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
    if (!circle) return undefined;
    
    const daysAgo = getAnchorDaysAgo(anchorFilter);
    const now = new Date();

    if (daysAgo === 0 && circle.activeAnchor) {
      return circle.activeAnchor;
    }

    if (circle.pastAnchors && circle.pastAnchors.length > 0) {
      const pastAnchor = circle.pastAnchors.find((anchor: any) => {
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

  const [joining, setJoining] = useState(false);

  const toggleJoin = async () => {
    if (joining) return;
    
    try {
      setJoining(true);
      const wasJoined = circle?.isJoined;
      
      if (!wasJoined) {
        setCircle((prev: any) => prev ? {
          ...prev,
          isJoined: true,
          memberCount: (prev.memberCount ?? 0) + 1,
        } : null);
      }

      if (wasJoined) {
        const result = await leaveCircleMutation(circleId);
        
        if (result?.error) {
          setCircle((prev: any) => prev ? {
            ...prev,
            isJoined: true,
          } : null);
        }
      } else {
        const result = await joinCircleMutation(circleId);
        
        if (result?.error) {
          setCircle((prev: any) => prev ? {
            ...prev,
            isJoined: false,
            memberCount: Math.max(0, (prev.memberCount ?? 1) - 1),
          } : null);
        }
      }
    } catch (err: any) {
      console.error("Failed to toggle join:", err);
      setCircle((prev: any) => prev ? {
        ...prev,
        isJoined: circle?.isJoined,
      } : null);
    } finally {
      setJoining(false);
    }
  };

  /* =========================
      SCROLL
  ========================= */

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;

    setShowChevron(scrollY > 200);

    const headerHeight = 390;
    if (scrollY >= headerHeight && !hasScrolledPastHeader) {
      setHasScrolledPastHeader(true);
    }

    if (scrollY <= 10 && hasScrolledPastHeader) {
      setHasScrolledPastHeader(false);
    }

    if (anchorStickyThreshold.current > 0) {
      if (scrollY >= anchorStickyThreshold.current && !showFixedAnchor) {
        setShowFixedAnchor(true);
        setAnchorCardVisible(false);
      } else if (scrollY < anchorStickyThreshold.current && showFixedAnchor) {
        setShowFixedAnchor(false);
      }
    }

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
    <YStack>
      <CircleFeedItem post={item} circleId={circleId} />

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

  if (loading || !circle) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {apiError ? (
            <Text fontFamily="$body" fontSize={14} color={colors.gray}>{apiError}</Text>
          ) : (
            <>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text fontFamily="$body" fontSize={14} color={colors.gray} marginTop={12}>
                Loading...
              </Text>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

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
            <XStack justifyContent="space-between" alignItems="center" backgroundColor={anchorCardVisible ? "#fff" : "#E4C0F180"} padding={10} borderRadius={8}>
             <Pressable onPress={() => setAnchorCardVisible(!anchorCardVisible)}>
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
            
            {anchorCardVisible && <AnchorCard anchor={displayAnchor} circleId={circleId} />}

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
        windowSize={7}
        maxToRenderPerBatch={10}
        removeClippedSubviews={true}
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

            {displayAnchor && !showFixedAnchor && (
              <YStack onLayout={(e) => {
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
                <AnchorCard anchor={displayAnchor} circleId={circleId} />

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
          FAB (only show when joined)
      ========================= */}

      {circle?.isJoined && (
        <View style={styles.fabContainer}>
          <Button
            circular
            size="$6"
            backgroundColor={colors.primary}
            onPress={() => {
              router.push({
                pathname: "/CircleExtension/CircleCommentComposer",
                params: { circleId: circleId, fromScreen: "circleFeed" },
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
      )}
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
    top: 100,
    left: 0,
    right: 0,
    zIndex: 40,
    paddingTop: 10,
    backgroundColor: colors.white,
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

  errorBanner: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    zIndex: 200,
  },
});
