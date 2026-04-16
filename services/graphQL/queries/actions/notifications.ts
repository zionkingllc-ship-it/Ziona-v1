import { graphqlRequest } from "@/services/graphQL/graphqlClient";

export type NotificationActor = {
  id: string;
  username: string;
  avatarUrl?: string;
};

export type NotificationTarget = {
  id: string;
  type: string;
  content?: string;
};

export type Notification = {
  id: string;
  type: string;
  actor: NotificationActor;
  target?: NotificationTarget;
  createdAt: string;
  read: boolean;
};

export type NotificationsResponse = {
  items: Notification[];
  hasMore: boolean;
  nextCursor?: string;
};

export async function getNotifications(limit: number = 20): Promise<NotificationsResponse> {
  const query = `
    query GetNotification($limit: Int, $cursor: String) {
      notifications(limit: $limit, cursor: $cursor) {
        items {
          id
          type
          createdAt
          read
          actor {
            id
            username
            avatarUrl
          }
          target {
            id
            type
            content
          }
        }
        hasMore
        nextCursor
      }
    }
  `;

  try {
    const data = await graphqlRequest(query, { limit });
    return data?.notifications ?? { items: [], hasMore: false };
  } catch {
    return { items: [], hasMore: false };
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const mutation = `
    mutation MarkRead($notificationId: ID!) {
      markNotificationAsRead(notificationId: $notificationId) {
        success
        error
      }
    }
  `;

  const data = await graphqlRequest(mutation, { notificationId });
  return data?.markNotificationAsRead?.success ?? false;
}

export async function markAllNotificationsAsRead(): Promise<boolean> {
  const mutation = `
    mutation MarkAllRead {
      markAllNotificationsAsRead {
        success
        error
      }
    }
  `;

  const data = await graphqlRequest(mutation, {});
  return data?.markAllNotificationsAsRead?.success ?? false;
}

export async function deleteNotification(notificationId: string): Promise<boolean> {
  const mutation = `
    mutation DeleteNotif($notificationId: ID!) {
      deleteNotification(notificationId: $notificationId) {
        success
        error
      }
    }
  `;

  const data = await graphqlRequest(mutation, { notificationId });
  return data?.deleteNotification?.success ?? false;
}

export type NotificationPreferences = {
  anchorNotifications: boolean;
  replyNotifications: boolean;
  likeNotifications: boolean;
  circleActivityNotifications: boolean;
  adminAnnouncements: boolean;
};

export async function updateNotificationPreferences(
  preferences: NotificationPreferences
): Promise<NotificationPreferences | null> {
  const mutation = `
    mutation UpdatePrefs($preferences: PreferencesInput!) {
      updateNotificationPreferences(preferences: $preferences) {
        anchorNotifications
        replyNotifications
        likeNotifications
        circleActivityNotifications
        adminAnnouncements
      }
    }
  `;

  const data = await graphqlRequest(mutation, { preferences });
  return data?.updateNotificationPreferences ?? null;
}

export async function registerDeviceToken(
  token: string,
  platform: string
): Promise<boolean> {
  const mutation = `
    mutation RegisterDevice($token: String!, $platform: String!) {
      registerDeviceToken(token: $token, platform: $platform) {
        success
      }
    }
  `;

  const data = await graphqlRequest(mutation, { token, platform });
  return data?.registerDeviceToken?.success ?? false;
}
