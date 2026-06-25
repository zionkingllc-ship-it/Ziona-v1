import AnchorCard from "@/components/circles/AnchorCard";
import CircleFeedBanner from "@/components/circles/CircleFeedBanner";
import CircleFeedDescription from "@/components/circles/CircleFeedDescription";
import CircleFeedFilterModal from "@/components/circles/CircleFeedFilterModal";
import CircleFeedFilterRow from "@/components/circles/CircleFeedFilterRow";
import CircleFeedItem from "@/components/circles/CircleFeedItem";
import CircleFeedProfileSection, {
  CircleFeedNameRow,
} from "@/components/circles/CircleFeedProfileSection";

import SuccessModal from "@/components/ui/modals/successModal";
import colors from "@/constants/colors";

import { ActiveAnchor, CircleFeedData } from "@/constants/circleTypes";

import { useCircleFeedData, useJoinCircle, useLeaveCircle, useActiveAnchor, useAnchorByDate } from "@/hooks/useCircles";

import { Ionicons } from "@expo/vector-icons";
import { ChevronDown } from "@tamagui/lucide-icons";

import { useLocalSearchParams, useRouter } from "expo-router";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useFocusEffect } from "@react-navigation/native";
import { Platform, StatusBar } from "react-native";

import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
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

const anchorFilterOptions = [
  "Today", "Yesterday", "2 days ago", "3 days ago", "4 days ago", "5 days ago",
];

const getAnchorDaysAgo = (filter: string): number => {
  if (filter === "Today") return 0;
  const match = filter.match(/(\d+) days ago/);
  return match ? parseInt(match[1]) : 0;
};

const getAnchorDaysDiff = (createdAt: string): number => {
  const created = new Date(createdAt);
  const now = new Date();
  const diff = Math.round((now.getTime() - created.getTime()) / (24 * 60 * 60 * 1000));
  console.log("[anchor-debug] getAnchorDaysDiff:", { createdAt, parsed: created.toISOString(), now: now.toISOString(), diff });
  return diff;
};

const getAvailableFilterOptions = (circle: CircleFeedData): string[] => {
  const all: ActiveAnchor[] = [];
  if (circle.activeAnchor) all.push(circle.activeAnchor);
  if (circle.pastAnchors) all.push(...circle.pastAnchors);
  console.log("[anchor-debug] getAvailableFilterOptions:", {
    activeAnchor: circle.activeAnchor
      ? { id: circle.activeAnchor.id, createdAt: circle.activeAnchor.createdAt, type: circle.activeAnchor.type }
      : null,
    pastAnchorsCount: circle.pastAnchors?.length ?? 0,
    pastAnchors: circle.pastAnchors?.map((a) => ({ id: a.id, createdAt: a.createdAt, type: a.type })),
    allCount: all.length,
  });
  if (all.length === 0) return [];

  const availableDays = new Set(all.map((a) => getAnchorDaysDiff(a.createdAt)));
  if (circle.activeAnchor) availableDays.add(0);

  const result = anchorFilterOptions.filter((opt) => {
    const daysAgo = getAnchorDaysAgo(opt);
    return availableDays.has(daysAgo);
  });
  console.log("[anchor-debug] availableOptions result:", { availableDays: [...availableDays], result });
  return result;
};

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
  viewerState?: {
    liked: boolean;
    prayed: boolean;
  };
  userId?: string;
  user: {
    name: string;
    avatar: string;
  };
};

function mapCircleFeedData(data: any): CircleFeedData {
  if (!data) {
    return {
      bannerImage: "",
      profileImage: "",
      name: "",
      description: "",
      memberCount: 0,
      isJoined: false,
      posts: [],
      memberAvatars: [],
      rules: [],
    };
  }

  return {
    bannerImage: data.bannerImage || "",
    profileImage: data.profileImage || "",
    name: data.name || "",
    description: data.description || "",
    memberCount: data.memberCount ?? 0,
    isJoined: data.isJoined ?? false,
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
          mediaUrl: data.activeAnchor.mediaUrl || undefined,
          bibleReference: data.activeAnchor.bibleReference || undefined,
          bibleText: data.activeAnchor.bibleText || undefined,
          backgroundColors: data.activeAnchor.backgroundColors as [string, string] | undefined,
          backgroundImage: data.activeAnchor.backgroundImage || undefined,
          prayedCount: data.activeAnchor.prayedCount || undefined,
          createdAt: data.activeAnchor.createdAt,
          expiresAt: data.activeAnchor.expiresAt || undefined,
          viewerState: data.activeAnchor.viewerState || undefined,
        }
      : undefined,
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
          mediaUrl: a.mediaUrl || undefined,
          bibleReference: a.bibleReference || undefined,
          bibleText: a.bibleText || undefined,
          backgroundColors: a.backgroundColors as [string, string] | undefined,
          backgroundImage: a.backgroundImage || undefined,
          prayedCount: a.prayedCount || undefined,
          createdAt: a.createdAt,
          expiresAt: a.expiresAt || undefined,
        }))
      : undefined,
    posts: data.posts
      ? data.posts.map((p: any) => {
          console.log("[mapCircleFeedData] raw post:", JSON.stringify({ id: p.id, text: p.text?.substring(0,30), media: p.media?.map((m:any) => ({ url: m.url?.substring(0,30), thumb: m.thumbnailUrl?.substring(0,30) })), mediaUrl: p.mediaUrl?.substring(0,30), mediaType: p.mediaType }));
          return {
          id: p.id,
          text: p.text || undefined,
          image: (p.mediaType === "VIDEO" ? p.media?.[0]?.thumbnailUrl : p.media?.[0]?.thumbnailUrl || p.media?.[0]?.url || p.mediaUrl) || undefined,
          mediaUrl: p.mediaUrl || undefined,
          mediaType: p.mediaType || undefined,
          createdAt: p.createdAt,
          likes: p.likes,
          comments: p.comments,
          likedImage: p.likedImage || undefined,
          likeCount: p.likeCount,
          anchorLikedCount: p.anchorLikedCount,
          prayedCount: p.prayedCount,
          viewerState: p.viewerState || undefined,
          userId: p.user?.id,
          user: {
            name: p.user.name || "",
            avatar: p.user.avatar || "",
          },
        };
      })
      : [],
    memberAvatars: data.memberAvatars || [],
    rules: data.rules
      ? data.rules.map((r: any) => ({
          id: r.ruleNumber,
          title: r.title,
          description: r.description,
        }))
      : [],
  };
}

export default function CircleFeedScreen() {
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === "ios") {
        StatusBar.setBarStyle("light-content", true);
      }
      return () => {
        if (Platform.OS === "ios") {
          StatusBar.setBarStyle("dark-content", true);
        }
      };
    }, [])
  );
  const { id, source, _name, _desc, _image, _members, _avatars } =
    useLocalSearchParams<{ id: string; source?: string; _name?: string; _desc?: string; _image?: string; _members?: string; _avatars?: string }>();

  const router = useRouter();
  const circleId = id || "1";

  const [filterSort, setFilterSort] = useState<"Trending" | "New">("Trending");
  const [filterView, setFilterView] = useState<"All" | "My post">("All");
  const userId = useAuthStore((s) => s.user?.id);

  const sortBy = filterSort === "New" ? "NEW" : "TRENDING";
  const authorId = filterView === "My post" ? userId : undefined;

  const { data, isLoading, isFetching, refetch } = useCircleFeedData(
    circleId, 10, 1, 20, sortBy, authorId,
  );

  const fallbackAvatars = useMemo(() => {
    try { return _avatars ? JSON.parse(_avatars) : []; } catch { return []; }
  }, [_avatars]);

  const circle = useMemo(() => {
    const feed = mapCircleFeedData(data);
    if (feed.name) return feed;
    return {
      ...feed,
      name: feed.name || _name || "",
      description: feed.description || _desc || "",
      bannerImage: feed.bannerImage || _image || "",
      profileImage: feed.profileImage || _image || "",
      memberCount: feed.memberCount || Number(_members) || 0,
      memberAvatars: feed.memberAvatars.length > 0 ? feed.memberAvatars : fallbackAvatars,
    };
  }, [data, _name, _desc, _image, _members, fallbackAvatars]);

  console.log("📦 [circleFeed] circle data:", {
    activeAnchor: circle.activeAnchor ? {
      id: circle.activeAnchor.id,
      type: circle.activeAnchor.type,
      title: circle.activeAnchor.title,
      backgroundColors: circle.activeAnchor.backgroundColors,
      backgroundImage: circle.activeAnchor.backgroundImage ? "yes" : "no",
    } : null,
    pastAnchorsCount: circle.pastAnchors?.length ?? 0,
    postsCount: circle.posts?.length ?? 0,
    firstPostSample: circle.posts?.[0] ? { id: circle.posts[0].id, text: (circle.posts[0].text || "").substring(0, 30), image: circle.posts[0].image ? "yes" : "no", mediaUrl: circle.posts[0].mediaUrl ? "yes" : "no" } : null,
  });

  const posts: CirclePost[] = circle.posts;

  const joinMutation = useJoinCircle();
  const leaveMutation = useLeaveCircle();

  const displayedPosts = useMemo(() => {
    if (filterSort === "New") {
      return [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return posts;
  }, [posts, filterSort]);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [refreshingFeed, setRefreshingFeed] = useState(false);

  const onRefreshFeed = useCallback(async () => {
    setRefreshingFeed(true);
    await refetch();
    setRefreshingFeed(false);
  }, [refetch]);

  const [showChevron, setShowChevron] = useState(false);
  const [hasScrolledPastHeader, setHasScrolledPastHeader] = useState(false);
  const [showAnchorCard, setShowAnchorCard] = useState(true);
  const [showFixedAnchor, setShowFixedAnchor] = useState(false);
  const anchorStickyThreshold = useRef(0);
  const [anchorSectionHeight, setAnchorSectionHeight] = useState(0);
  const [anchorFilter, setAnchorFilter] = useState("Today");
  const [showAnchorDropdown, setShowAnchorDropdown] = useState(false);
  const [anchorCardVisible, setAnchorCardVisible] = useState(false);

  const availableOptions = getAvailableFilterOptions(circle);
  console.log("[anchor-debug] component render:", { anchorFilter, availableOptions, hasActive: !!circle.activeAnchor, pastCount: circle.pastAnchors?.length });

  const filterDate = useMemo(() => {
    if (anchorFilter === "Today") return null;
    const daysAgo = anchorFilter === "Yesterday" ? 1 : parseInt(anchorFilter.match(/(\d+)/)?.[0] || "0");
    return new Date(Date.now() - daysAgo * 86400000).toISOString().split("T")[0];
  }, [anchorFilter]);

  const { data: activeAnchorData } = useActiveAnchor(anchorFilter === "Today" ? circleId : "");
  const { data: anchorByDateData } = useAnchorByDate(
    circleId,
    filterDate ?? "",
  );

  const displayAnchor = useMemo(() => {
    if (anchorFilter === "Today") {
      return activeAnchorData ?? circle?.activeAnchor ?? undefined;
    }
    return anchorByDateData ?? circle?.activeAnchor ?? undefined;
  }, [anchorFilter, activeAnchorData, circle?.activeAnchor, anchorByDateData]);

  const anchorExpired = useMemo(() => {
    if (!displayAnchor?.expiresAt) return false;
    return new Date(displayAnchor.expiresAt).getTime() <= Date.now();
  }, [displayAnchor]);

  useEffect(() => {
    if (availableOptions.length > 0 && !availableOptions.includes(anchorFilter)) {
      setAnchorFilter(availableOptions[0]);
    }
  }, [availableOptions.join(","), anchorFilter]);

  const flatListRef = useRef<FlatList>(null);

  const [joining, setJoining] = useState(false);
  const [joinErrorVisible, setJoinErrorVisible] = useState(false);
  const [joinErrorMessage, setJoinErrorMessage] = useState("");
  const [joinErrorTitle, setJoinErrorTitle] = useState("");
  const [joinSuccessVisible, setJoinSuccessVisible] = useState(false);
  const [joinSuccessTitle, setJoinSuccessTitle] = useState("");
  const [joinSuccessMessage, setJoinSuccessMessage] = useState("");
  const [leaveConfirmVisible, setLeaveConfirmVisible] = useState(false);

  const toggleJoin = async () => {
    if (joining) return;
    if (circle?.isJoined) {
      setLeaveConfirmVisible(true);
      return;
    }
    setJoining(true);
    try {
      const result = await joinMutation.mutateAsync(circleId);
      const payload = result?.joinCircle ?? result;
      if (payload?.success === false) {
        setJoinErrorTitle("Unable to join");
        setJoinErrorMessage(payload?.error?.message || "Something went wrong. Please try again.");
        setJoinErrorVisible(true);
      } else {
        setJoinSuccessTitle("Joined circle");
        setJoinSuccessMessage("You have joined this circle.");
        setJoinSuccessVisible(true);
      }
    } catch (err: any) {
      console.error("Failed to join:", err);
      setJoinErrorTitle("Action failed");
      setJoinErrorMessage(err?.message || "Something went wrong. Please try again.");
      setJoinErrorVisible(true);
    } finally {
      setJoining(false);
    }
  };

  const confirmLeave = async () => {
    setLeaveConfirmVisible(false);
    setJoining(true);
    try {
      const result = await leaveMutation.mutateAsync(circleId);
      const payload = result?.leaveCircle ?? result;
      if (payload?.success === false) {
        setJoinErrorTitle("Unable to leave");
        setJoinErrorMessage(payload?.error?.message || "Something went wrong. Please try again.");
        setJoinErrorVisible(true);
      } else {
        setJoinSuccessTitle("Left circle");
        setJoinSuccessMessage("You have left this circle.");
        setJoinSuccessVisible(true);
      }
    } catch (err: any) {
      console.error("Failed to leave:", err);
      setJoinErrorTitle("Action failed");
      setJoinErrorMessage(err?.message || "Something went wrong. Please try again.");
      setJoinErrorVisible(true);
    } finally {
      setJoining(false);
    }
  };

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

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({
      offset: 0,
      animated: true,
    });
  };

  const renderItem = ({ item }: { item: CirclePost }) => (
    <YStack>
      <CircleFeedItem
        post={item}
        circleId={circleId}
      />
      <YStack
        height={1}
        backgroundColor={colors.border}
        width={"90%"}
        alignSelf="center"
      />
    </YStack>
  );

  const renderEmpty = () => (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      paddingVertical={40}
    >
      <Text fontFamily="$body" fontWeight="400" color={colors.gray}>
        {circle.isJoined ? "No posts yet" : "No posts to show"}
      </Text>
      <Text
        fontFamily="$body"
        fontWeight="400"
        fontSize={12}
        color={colors.gray}
        marginTop={4}
      >
        {circle.isJoined
          ? "Be the first to post in this circle!"
          : "Join this circle to see posts and anchors"}
      </Text>
    </YStack>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text fontFamily="$body" fontSize={14} color={colors.gray} marginTop={12}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.white }}
      edges={["top"]}
    >
      <View style={styles.fixedBanner}>
        <CircleFeedBanner
          bannerImage={circle.bannerImage}
          isCompact={hasScrolledPastHeader}
          circleName={circle.name}
          isJoined={circle.isJoined}
          loading={joining}
          onToggleJoin={toggleJoin}
          onBack={() => router.back()}
        />
      </View>

      {showFixedAnchor && (
        <View style={styles.fixedAnchor}>
          <YStack paddingHorizontal={16}>
            <XStack justifyContent="space-between" alignItems="center" backgroundColor={anchorCardVisible ? "#fff" : "#E4C0F180"} padding={10} borderRadius={8}>
             <Pressable onPress={() => setAnchorCardVisible(!anchorCardVisible)}>
              <XStack alignItems="flex-start" gap={8}>
                <Image source={require("@/assets/images/AnchorPin.png")} style={{ width: 16, height: 16 }} />
                <YStack>
                  <Text fontFamily="$body" fontWeight={'600'} fontSize={13} color={colors.text} marginBottom={4}>
                    Anchor
                  </Text>
                  <Text fontFamily="$body" fontWeight={'400'} fontSize={13} color={colors.secondaryText} marginBottom={4}>
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
                {availableOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setAnchorFilter(opt);
                      setShowAnchorDropdown(false);
                    }}
                  >
                    <Text fontFamily="$body" fontSize={10} fontWeight={'500'} color={colors.text}>
                      {opt}
                    </Text>
                    {opt === anchorFilter && (
                      <Text style={{ fontSize: 13 }}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {displayAnchor && anchorCardVisible && <AnchorCard anchor={displayAnchor} circleId={circleId} expired={anchorExpired} />}
            <CircleFeedFilterRow
              filterSort={filterSort}
              filterView={filterView}
              onPress={() => setShowFilterModal(true)}
            />
          </YStack>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={displayedPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        onScroll={handleScroll}
        refreshing={refreshingFeed}
        onRefresh={onRefreshFeed}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        windowSize={7}
        maxToRenderPerBatch={10}
        removeClippedSubviews={true}
        contentContainerStyle={{
          paddingTop: 110 + (showFixedAnchor ? anchorSectionHeight : 0),
          paddingBottom: 16,
        }}
        ListHeaderComponent={
          <YStack paddingHorizontal={16} bottom={30}>
            <YStack bottom={20}>
              <CircleFeedProfileSection
                circle={circle}
                onToggleJoin={toggleJoin}
                joining={joining}
              />
              <CircleFeedNameRow
                circle={circle}
                memberAvatars={circle.memberAvatars}
              />
              <CircleFeedDescription circle={circle} />
            </YStack>

            {!showFixedAnchor && (
              <YStack onLayout={(e) => {
                anchorStickyThreshold.current = e.nativeEvent.layout.y;
                setAnchorSectionHeight(e.nativeEvent.layout.height);
              }}>
                <XStack justifyContent="space-between" alignItems="center">
                  <XStack alignItems="flex-start" gap={8}>
                    <Image source={require("@/assets/images/AnchorPin.png")} style={{ width: 16, height: 16 }} />
                    <YStack>
                      <Text fontFamily="$body" fontWeight={'600'} fontSize={13} color={colors.text} marginBottom={4}>
                        Anchor
                      </Text>
                      <Text fontFamily="$body" fontWeight={'400'} fontSize={13} color={colors.secondaryText} marginBottom={4}>
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
                    {availableOptions.map((opt) => (
                      <TouchableOpacity
                        key={opt}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setAnchorFilter(opt);
                          setShowAnchorDropdown(false);
                        }}
                      >
                        <Text fontFamily="$body" fontSize={10} fontWeight={'500'} color={colors.text}>
                          {opt}
                        </Text>
                        {opt === anchorFilter && (
                          <Text style={{ fontSize: 13 }}>✓</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                {displayAnchor && <AnchorCard anchor={displayAnchor} circleId={circleId} expired={anchorExpired} />}
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

      {circle?.isJoined && (
        <View style={styles.fabContainer}>
            <Button
              circular
              size="$6"
              backgroundColor={colors.primary}
              onPress={() => {
                // Use explicit query string to guarantee the circleId appears in the URL
                // The route path should not include group folder names such as (tabs).
                // Use explicit URL with querystring to ensure the circleId becomes a search param
                const path = `/(tabs)/circle/PostComposerScreen?circleId=${encodeURIComponent(circleId)}`;
                console.log("[FAB] navigating to PostComposerScreen", { path });
                router.push(path as any);
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
      <SuccessModal
        visible={joinSuccessVisible}
        onClose={() => setJoinSuccessVisible(false)}
        title={joinSuccessTitle}
        message={joinSuccessMessage}
        type="success"
        autoClose
        duration={1500}
      />
      <SuccessModal
        visible={joinErrorVisible}
        onClose={() => setJoinErrorVisible(false)}
        title={joinErrorTitle}
        message={joinErrorMessage}
        type="failed"
        autoClose={false}
        withButton
        buttonText="OK"
        onButtonPress={() => setJoinErrorVisible(false)}
      />

      <Modal
        visible={leaveConfirmVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}
          onPress={() => setLeaveConfirmVisible(false)}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              padding: 28,
              marginHorizontal: 32,
              width: "85%",
              maxWidth: 340,
            }}
          >
            <Text fontFamily="$body" fontSize={20} fontWeight="600" color="#181419" marginBottom={12} textAlign="center">
              Are you sure you want to leave?
            </Text>

            <Text fontFamily="$body" fontSize={13} fontWeight="400" color="#4E4252" lineHeight={18} marginBottom={24} textAlign="center">
              Leaving means you'll no longer see daily anchors, shared reflections, and discussions from this faith community. You're always welcome back anytime.
            </Text>

            <YStack gap={16} alignItems="center">
              <Pressable onPress={confirmLeave}>
                <Text fontFamily="$body" fontSize={13} fontWeight="400" color="red">
                  Leave
                </Text>
              </Pressable>
              <Pressable onPress={() => setLeaveConfirmVisible(false)}>
                <Text fontFamily="$body" fontSize={13} fontWeight="400" color="#4E4252">
                  Stay
                </Text>
              </Pressable>
            </YStack>
          </Pressable>
        </Pressable>
      </Modal>
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
    top: 80,
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
    zIndex: 9999,
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
