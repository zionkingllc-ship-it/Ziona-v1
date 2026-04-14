import Header from "@/components/layout/header";
import AuthPrompt from "@/components/ui/AuthPrompt";
import CenteredMessage from "@/components/ui/CenteredMessage";
import colors from "@/constants/colors";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from "@/hooks/useNotifications";
import { router } from "expo-router";
import { FlatList, TouchableOpacity, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, XStack, YStack, View } from "tamagui";
import { normalizeDate } from "@/utils/date/normalizeDate";

export default function NotificationsScreen() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data, isLoading } = useNotifications(20);
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const notifications = data?.items ?? [];

  const handleNotificationPress = async (item: typeof notifications[0]) => {
    if (!item.isRead) {
      await markAsRead.mutateAsync(item.id);
    }

    if (item.referenceType === "POST" && item.referenceId) {
      router.push({
        pathname: "/viewer/[postId]",
        params: { postId: item.referenceId, source: "user" },
      });
    } else if (item.referenceType === "USER" && item.referenceId) {
      router.push(`/profile/${item.referenceId}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "LIKE":
        return "❤️";
      case "COMMENT":
        return "💬";
      case "FOLLOW":
        return "👤";
      case "MENTION":
        return "@";
      default:
        return "🔔";
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <XStack padding={10}>
          <Header heading="Notifications" />
        </XStack>
        <AuthPrompt
          message="Login to view notifications"
          buttonText="Login"
          buttonColor={colors.primary}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <XStack padding={10} justifyContent="space-between" alignItems="center">
        <Header heading="Notifications" />
        {notifications.some((n) => !n.isRead) && (
          <TouchableOpacity onPress={() => markAllAsRead.mutate()}>
            <Text fontFamily="$body" color={colors.primary} fontSize={14}>
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </XStack>

      {isLoading ? (
        <View flex={1} justifyContent="center" alignItems="center">
          <Text fontFamily="$body" color={colors.gray}>Loading...</Text>
        </View>
      ) : notifications.length === 0 ? (
        <CenteredMessage
          fontFamily="$body"
          text="No notifications yet"
          subtitle="When someone interacts with your posts, you'll see it here."
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleNotificationPress(item)}
              style={{
                backgroundColor: item.isRead ? colors.white : "#F5F0FF",
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.lightGrayBg,
              }}
            >
              <XStack gap={12} alignItems="center">
                <Text fontSize={24}>{getNotificationIcon(item.type)}</Text>
                <YStack flex={1}>
                  <Text
                    fontFamily="$body"
                    fontSize={14}
                    color={colors.black}
                    style={{ flexShrink: 1 }}
                  >
                    {item.message}
                  </Text>
                  <Text fontFamily="$body" fontSize={12} color={colors.gray} marginTop={2}>
                    {normalizeDate(item.createdAt)}
                  </Text>
                </YStack>
                {!item.isRead && (
                  <View
                    width={8}
                    height={8}
                    borderRadius={4}
                    backgroundColor={colors.primary}
                  />
                )}
              </XStack>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
