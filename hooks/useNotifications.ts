import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/services/graphQL/queries/actions/notifications";
import type { NotificationCategory } from "@/src/types/__generated__/graphql";
import { setBadgeCountAsync } from "expo-notifications";

async function syncBadgeCount() {
  try {
    const count = await getUnreadNotificationCount();
    await setBadgeCountAsync(count);
  } catch { console.warn("[useNotifications] syncBadgeCount failed"); }
}

export function useNotifications(limit: number = 20, category?: NotificationCategory) {
  return useInfiniteQuery({
    queryKey: ["notifications", limit, category],
    queryFn: ({ pageParam }) => getNotifications(limit, pageParam, category),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage?.hasMore ? lastPage.nextCursor : undefined,
    staleTime: 0,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["unreadNotificationCount"],
    queryFn: getUnreadNotificationCount,
    refetchInterval: 30000,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
      syncBadgeCount();
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
      syncBadgeCount();
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
      syncBadgeCount();
    },
  });
}
