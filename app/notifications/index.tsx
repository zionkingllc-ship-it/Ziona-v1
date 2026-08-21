import { Image as ExpoImage } from "expo-image";
import { Text, View } from "tamagui";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet } from "react-native";
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/constants/colors";
import { useNotifications, useMarkNotificationAsRead, useDeleteNotification } from "@/hooks/useNotifications";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NotificationItem } from "@/services/graphQL/queries/actions/notifications";
import Header from "@/components/layout/header";
import AuthPrompt from "@/components/ui/AuthPrompt";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationMuteStore } from "@/store/useNotificationMuteStore";
import { resolveNotificationDestination } from "@/src/services/notifications/notificationNavigation";

const filters = ["All", "Follows", "Mentions", "Replies", "Circles"] as const;
type Filter = (typeof filters)[number];

function matchesFilter(item: NotificationItem, filter: Filter): boolean {
  switch (filter) {
    case "Follows":
      return item.referenceType === "follow" || item.type === "follow";
    case "Mentions":
      return item.referenceType === "mention" || item.type === "mention";
    case "Replies":
      return item.referenceType === "comment" || item.type === "comment";
    case "Circles":
      return item.referenceType === "circle" || item.referenceType === "circle_post";
    case "All":
    default:
      return true;
  }
}

function getInitials(name?: string): string {
  if (!name) return "Ur";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getColorFromName(name?: string): string {
  if (!name) return "#7A2E8A";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const palette = ["#7A2E8A", "#4A90A4", "#E58E26", "#2E8A6A", "#8A4A2E", "#4A2E8A"];
  return palette[Math.abs(hash) % palette.length];
}

function NotificationAvatar({ avatarUrl, username, size = 31 }: { avatarUrl?: string | null; username?: string; size?: number }) {
  const [erred, setErred] = useState(false);
  const hasValidUrl = !!avatarUrl && !erred;

  if (!hasValidUrl) {
    return (
      <View
        width={size}
        height={size}
        borderRadius={size / 2}
        backgroundColor={getColorFromName(username)}
        justifyContent="center"
        alignItems="center"
      >
        <Text color="white" fontSize={size * 0.36} fontWeight="600">
          {getInitials(username)}
        </Text>
      </View>
    );
  }

  return (
    <ExpoImage
      source={{ uri: avatarUrl }}
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: "#E5E1E6" }}
      onError={() => setErred(true)}
    />
  );
}

export default function ActivityScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } = useNotifications(50);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<Filter>("All");
  const markAsRead = useMarkNotificationAsRead();
  const deleteNotif = useDeleteNotification();
  const [menuItem, setMenuItem] = useState<NotificationItem | null>(null);
  const mutedUserIds = useNotificationMuteStore((s) => s.mutedUserIds);
  const muteUser = useNotificationMuteStore((s) => s.muteUser);

  const notifications = useMemo(() => {
    const all: NotificationItem[] = data?.pages?.flatMap((p) => p.items) ?? [];
    return all.filter(
      (n) => matchesFilter(n, selectedFilter) && !mutedUserIds.includes(n.user?.id ?? ""),
    );
  }, [data, selectedFilter, mutedUserIds]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const formatTime = useCallback((dateString: string) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${d.getFullYear()}`;
  }, []);

  const handleNotificationPress = useCallback(
    (item: NotificationItem) => {
      if (!item.isRead) {
        markAsRead.mutate(item.id);
      }
      const path = resolveNotificationDestination({
        referenceType: item.referenceType,
        referenceId: item.referenceId,
      });
      if (path !== "/notifications") {
        router.push(path as any);
      }
    },
    [markAsRead, router],
  );

  const renderNotification = useCallback(
    ({ item }: { item: NotificationItem }) => {
      return (
        <Pressable style={styles.activityRow} onPress={() => handleNotificationPress(item)}>
          <NotificationAvatar avatarUrl={item.user?.avatarUrl} username={item.user?.username} />

          <View style={styles.activityContent}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {item.user?.username || "Ziona"}
              </Text>
              <Text style={styles.date}>{formatTime(item.createdAt)}</Text>
            </View>

            <Text style={styles.subtitle} numberOfLines={1}>
              {item.title}
            </Text>

            {!!item.message && (
              <Text style={styles.message} numberOfLines={4}>
                {item.message}
              </Text>
            )}
          </View>

          <Pressable style={styles.menuButton} hitSlop={10} onPress={() => setMenuItem(item)}>
            <Ionicons name="ellipsis-horizontal" size={17} color="#17131A" />
          </Pressable>

          {!item.isRead && <View style={styles.notificationDot} />}
        </Pressable>
      );
    },
    [formatTime, handleNotificationPress],
  );

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

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.screen}>
        <Header
          heading="Activity"
        />

        {/* Filter tabs */}
        <View style={styles.filterWrapper}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={filters}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.filterContent}
            renderItem={({ item }) => {
              const selected = selectedFilter === item;
              return (
                <Pressable
                  onPress={() => setSelectedFilter(item)}
                  style={[styles.filterButton, selected && styles.filterButtonSelected]}
                >
                  <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                    {item}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>

        {/* Activity feed */}
        <View style={{ flex: 1 }}>
          {isLoading ? (
            <View style={styles.centerFill}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.centerFill}>
              <Text color={colors.gray}>No notifications yet</Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              renderItem={renderNotification}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.feedContent}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
              }
              ListFooterComponent={
                isFetchingNextPage ? (
                  <View style={styles.footerSpinner}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                ) : null
              }
            />
          )}
        </View>
      </View>

      {/* Row menu */}
      {menuItem && (
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuItem(null)}>
          <Pressable style={styles.menuCard} onPress={(e) => e.stopPropagation()}>
            <Pressable
              style={styles.menuRow}
              onPress={() => {
                deleteNotif.mutate(menuItem.id);
                setMenuItem(null);
              }}
            >
              <Ionicons name="trash-outline" size={18} color="#17131A" />
              <Text style={styles.menuText}>Delete notification</Text>
            </Pressable>
            <Pressable
              style={styles.menuRow}
              onPress={() => {
                if (menuItem.user?.id) muteUser(menuItem.user.id);
                setMenuItem(null);
              }}
            >
              <Ionicons name="thumbs-down-outline" size={18} color="#17131A" />
              <Text style={styles.menuText}>Show fewer notification like this</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  centerFill: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /* ---------------- Filters ---------------- */

  filterWrapper: {
    height: 42,
    width: "100%",
  },

  filterContent: {
    paddingHorizontal: 20,
    gap: 7,
    alignItems: "center",
  },

  filterButton: {
    height: 26,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#EEE9EF",
    backgroundColor: "#FAF9FA",
    justifyContent: "center",
    alignItems: "center",
  },

  filterButtonSelected: {
    backgroundColor: "#17131A",
    borderColor: "#17131A",
  },

  filterText: {
    fontSize: 13,
    fontWeight: "400",
    color: "#5F5362",
  },

  filterTextSelected: {
    color: "#FFFFFF",
  },

  /* ---------------- Feed ---------------- */

  feedContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  activityRow: {
    minHeight: 73,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    position: "relative",
  },

  activityContent: {
    flex: 1,
    marginLeft: 9,
    paddingRight: 4,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 15,
  },

  name: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "600",
    color: "#201B22",
    maxWidth: 120,
  },

  date: {
    marginLeft: 4,
    fontSize: 13,
    lineHeight: 17,
    color: "#8B7191",
    fontWeight: "400",
  },

  subtitle: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 17,
    color: "#8B7191",
  },

  message: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 17,
    color: "#282329",
    paddingRight: 3,
  },

  menuButton: {
    width: 23,
    height: 23,
    alignItems: "flex-end",
    justifyContent: "flex-start",
    marginLeft: 2,
  },

  notificationDot: {
    position: "absolute",
    right: -1,
    top: 32,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#17131A",
  },

  separator: {
    height: 1,
    backgroundColor: "#F0EDF1",
  },

  footerSpinner: {
    paddingVertical: 16,
    alignItems: "center",
  },

  /* ---------------- Row menu ---------------- */

  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
    zIndex: 10,
  },

  menuCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 8,
    paddingBottom: 24,
  },

  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },

  menuText: {
    fontSize: 13,
    color: "#17131A",
    fontWeight: "500",
  },
});