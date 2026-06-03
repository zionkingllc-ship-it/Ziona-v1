import { Image, Text, XStack, YStack, View } from "tamagui";
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet } from "react-native";
import { useCallback, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/constants/colors";
import { useNotifications, useMarkNotificationAsRead, useDeleteNotification } from "@/hooks/useNotifications";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NotificationItem } from "@/services/graphQL/queries/actions/notifications";
import Header from "@/components/layout/header";
import AuthPrompt from "@/components/ui/AuthPrompt";
import CloseButton from "@/components/ui/CloseButton";
import { useAuthStore } from "@/store/useAuthStore";

const ANCHOR_PIN = require("@/assets/images/AnchorPin.png");

type NotifIcon = { icon: keyof typeof Ionicons.glyphMap; color: string } | { icon: "anchorPin"; color: string };
const NOTIF_ICON_MAP: Record<string, NotifIcon> = {
  like_post: { icon: "heart-outline", color: "#FF3B30" },
  new_anchor: { icon: "anchorPin", color: "#6C2BD9" },
  admin_announcement: { icon: "megaphone-outline", color: "#FF9500" },
};

function getNotifIcon(type: string): NotifIcon {
  return NOTIF_ICON_MAP[type] ?? { icon: "notifications-outline" as const, color: "#8E8E93" };
}

function NotificationAvatar({ avatarUrl, type, size = 40 }: { avatarUrl?: string | null; type?: string; size?: number }) {
  const [erred, setErred] = useState(false);
  const hasValidUrl = !!avatarUrl && !erred;

  if (!hasValidUrl) {
    const entry = getNotifIcon(type ?? "");
    if (entry.icon === "anchorPin") {
      return (
        <View width={size} height={size} borderRadius={size / 2} backgroundColor="#FFF" borderWidth={2} borderColor={entry.color} justifyContent="center" alignItems="center">
          <Image source={ANCHOR_PIN} width={size * 0.55} height={size * 0.55} />
        </View>
      );
    }
    return (
      <View width={size} height={size} borderRadius={size / 2} backgroundColor={entry.color} justifyContent="center" alignItems="center">
        <Ionicons name={entry.icon} size={size * 0.55} color="#FFF" />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: avatarUrl }}
      width={size}
      height={size}
      borderRadius={size / 2}
      onError={() => setErred(true)}
    />
  );
}

export default function ActivityScreen() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useNotifications(50);
  const markAsRead = useMarkNotificationAsRead();
  const deleteNotif = useDeleteNotification();
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const isSelecting = selectedIds.size > 0;

  const notifications: NotificationItem[] = data?.pages?.flatMap((p) => p.items) ?? [];

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days}d`;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `${hours}h`;
    const mins = Math.floor(diff / (1000 * 60));
    if (mins > 0) return `${mins}m`;
    return "Just now";
  };

  const handleNotificationPress = useCallback(
    (item: NotificationItem) => {
      if (isSelecting) {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (next.has(item.id)) next.delete(item.id);
          else next.add(item.id);
          return next;
        });
        return;
      }
      if (!item.isRead) {
        markAsRead.mutate(item.id);
      }
      setSelectedNotification(item);
    },
    [isSelecting, markAsRead],
  );

  const handleLongPress = useCallback((item: NotificationItem) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
  }, []);

  const handleMarkSelectedRead = useCallback(() => {
    selectedIds.forEach((id) => markAsRead.mutate(id));
    setSelectedIds(new Set());
  }, [selectedIds, markAsRead]);

  const handleDeleteSelected = useCallback(() => {
    selectedIds.forEach((id) => deleteNotif.mutate(id));
    setSelectedIds(new Set());
  }, [selectedIds, deleteNotif]);

  const handleCancelSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const renderNotification = useCallback(
    ({ item }: { item: NotificationItem }) => {
      const selected = selectedIds.has(item.id);
      return (
        <Pressable
          onPress={() => handleNotificationPress(item)}
          onLongPress={() => handleLongPress(item)}
          style={{ opacity: item.isRead ? 0.6 : 1 }}
        >
          <XStack justifyContent="space-between" alignItems="center" paddingVertical={12} paddingHorizontal={12}>
            {isSelecting && (
              <View marginRight={10}>
                <Ionicons
                  name={selected ? "checkbox" : "square-outline"}
                  size={22}
                  color={selected ? colors.primary : colors.gray}
                />
              </View>
            )}
            <XStack gap="$3" flex={1}>
              <NotificationAvatar avatarUrl={item.user?.avatarUrl} type={item.type} size={40} />
              <YStack flex={1}>
                <Text fontWeight="600" fontSize={14} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text fontSize={13} color={colors.gray} numberOfLines={2}>
                  {item.message}
                </Text>
                <Text fontSize={11} color={colors.lightGray}>
                  {formatTime(item.createdAt)}
                </Text>
              </YStack>
            </XStack>

            {!item.isRead && !isSelecting && (
              <View width={8} height={8} borderRadius={4} backgroundColor={colors.primary} />
            )}
          </XStack>
          <View height={0.5} backgroundColor={colors.lightGrayBg} />
        </Pressable>
      );
    },
    [handleNotificationPress, handleLongPress, isSelecting, selectedIds],
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={["top"]}>
      {isSelecting ? (
        <XStack
          backgroundColor={colors.white}
          paddingHorizontal={12}
          paddingVertical={10}
          borderBottomWidth={1}
          borderBottomColor={colors.border}
          justifyContent="space-between"
          alignItems="center"
        >
          <XStack gap={16} alignItems="center">
            <Pressable onPress={handleCancelSelection}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
            <Text fontFamily="$body" fontSize={15} fontWeight="600" color={colors.text}>
              {selectedIds.size} selected
            </Text>
          </XStack>
          <XStack gap={16} alignItems="center">
            <Pressable onPress={handleMarkSelectedRead}>
              <XStack gap={4} alignItems="center">
                <Ionicons name="checkmark-done" size={20} color={colors.primary} />
                <Text fontFamily="$body" fontSize={13} color={colors.primary} fontWeight="500">
                  Mark read
                </Text>
              </XStack>
            </Pressable>
            <Pressable onPress={handleDeleteSelected}>
              <XStack gap={4} alignItems="center">
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                <Text fontFamily="$body" fontSize={13} color="#FF3B30" fontWeight="500">
                  Delete
                </Text>
              </XStack>
            </Pressable>
          </XStack>
        </XStack>
      ) : (
        <Header heading="Activity" />
      )}
      <YStack flex={1}>
        {isLoading ? (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <ActivityIndicator size="large" color={colors.primary} />
          </YStack>
        ) : notifications.length === 0 ? (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <Text color={colors.gray}>No notifications yet</Text>
          </YStack>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderNotification}
            showsVerticalScrollIndicator={false}
            windowSize={5}
            maxToRenderPerBatch={15}
            removeClippedSubviews={true}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={isFetchingNextPage ? (
              <YStack paddingVertical={16} alignItems="center">
                <ActivityIndicator size="small" color={colors.primary} />
              </YStack>
            ) : null}
          />
        )}
      </YStack>

      <Modal
        visible={!!selectedNotification}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setSelectedNotification(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setSelectedNotification(null)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            {selectedNotification && (
              <YStack padding={24} gap={16}>
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontWeight="700" fontSize={18}>
                    Notification
                  </Text>
                  <CloseButton onPress={() => setSelectedNotification(null)} size={24} />
                </XStack>

                <XStack gap="$3" alignItems="center">
                  <NotificationAvatar avatarUrl={selectedNotification.user?.avatarUrl} type={selectedNotification.type} size={48} />
                  <YStack flex={1}>
                    <Text fontWeight="600" fontSize={16} numberOfLines={1}>
                      {selectedNotification.user?.username || "Ziona"}
                    </Text>
                    <Text fontSize={12} color={colors.lightGray}>
                      {formatTime(selectedNotification.createdAt)}
                    </Text>
                  </YStack>
                </XStack>

                <Text fontWeight="600" fontSize={16}>
                  {selectedNotification.title}
                </Text>

                <Text fontSize={14} color={colors.gray} lineHeight={22}>
                  {selectedNotification.message}
                </Text>
              </YStack>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    marginHorizontal: 24,
    width: "85%",
    maxWidth: 400,
  },
});
