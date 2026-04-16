import { Image, Text, XStack, YStack, View } from "tamagui";
import { ActivityIndicator, FlatList, Pressable } from "react-native";
import { useState } from "react";
import colors from "@/constants/colors";
import { useNotifications, useMarkNotificationAsRead } from "@/hooks/useNotifications";
import { SafeAreaView } from "react-native-safe-area-context";

const TABS = ["All", "Follows", "Mentions", "Replies", "Circles"];

interface NotificationItem {
  id: string;
  type: string;
  actor: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  target?: {
    id: string;
    type: string;
    content?: string;
  };
  createdAt: string;
  read: boolean;
}

export default function ActivityScreen() {
  const [activeTab, setActiveTab] = useState("All");
  const { data: notificationsData, isLoading } = useNotifications(50);
  const markAsRead = useMarkNotificationAsRead();

  const notifications = notificationsData?.items ?? [];
  
  const filtered = notifications.filter((item: NotificationItem) => {
    if (activeTab === "All") return true;
    if (activeTab === "Follows") return item.type === "follow" || item.type === "follow_request";
    if (activeTab === "Mentions") return item.type === "mention";
    if (activeTab === "Replies") return item.type === "comment" || item.type === "reply";
    if (activeTab === "Circles") return item.type === "circle";
    return true;
  });

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

  const getNotificationContent = (item: NotificationItem) => {
    switch (item.type) {
      case "follow":
        return "started following you";
      case "follow_request":
        return "sent you a follow request";
      case "like":
        return "liked your post";
      case "comment":
        return "commented on your post";
      case "reply":
        return "replied to your comment";
      case "mention":
        return "mentioned you in a post";
      case "circle":
        return "invited you to a circle";
      default:
        return "";
    }
  };

  const Tab = ({ label }: { label: string }) => {
    const active = label === activeTab;

    return (
      <Pressable onPress={() => setActiveTab(label)}>
        <XStack
          paddingHorizontal={14}
          paddingVertical={6}
          borderRadius={20}
          backgroundColor={active ? colors.black : colors.lightGrayBg}
        >
          <Text color={active ? colors.white : colors.black} fontSize={13}>
            {label}
          </Text>
        </XStack>
      </Pressable>
    );
  };

  const renderNotification = ({ item }: { item: NotificationItem }) => {
    const handlePress = () => {
      if (!item.read) {
        markAsRead.mutate(item.id);
      }
    };

    return (
      <Pressable onPress={handlePress} style={{ opacity: item.read ? 0.6 : 1 }}>
        <XStack justifyContent="space-between" alignItems="flex-start" paddingVertical={12}>
          <XStack gap="$3" flex={1}>
            <Image
              source={item.actor.avatarUrl ? { uri: item.actor.avatarUrl } : require("@/assets/images/emptyDP.png")}
              width={40}
              height={40}
              borderRadius={20}
            />
            <YStack flex={1}>
              <Text fontWeight="600" fontSize={14}>
                {item.actor.username}{" "}
                <Text fontWeight="400" color={colors.gray}>
                  {formatTime(item.createdAt)}
                </Text>
              </Text>
              <Text color={colors.gray} fontSize={13}>
                {getNotificationContent(item)}
              </Text>
              {item.target?.content && (
                <Text marginTop={4} fontSize={13} numberOfLines={2}>
                  "{item.target.content}"
                </Text>
              )}
            </YStack>
          </XStack>

          {!item.read && (
            <View width={8} height={8} borderRadius={4} backgroundColor={colors.primary} />
          )}
        </XStack>
        <View height={0.5} backgroundColor={colors.lightGrayBg} />
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <YStack flex={1} paddingTop={50}>
        <Text textAlign="center" fontSize={18} fontWeight="600" marginBottom={12}>
          Activity
        </Text>

        <XStack padding={12} gap="$2">
          {TABS.map((t) => (
            <Tab key={t} label={t} />
          ))}
        </XStack>

        {isLoading ? (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <ActivityIndicator size="large" color={colors.primary} />
          </YStack>
        ) : filtered.length === 0 ? (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <Text color={colors.gray}>No notifications yet</Text>
          </YStack>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderNotification}
            contentContainerStyle={{ paddingHorizontal: 12 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </YStack>
    </SafeAreaView>
  );
}