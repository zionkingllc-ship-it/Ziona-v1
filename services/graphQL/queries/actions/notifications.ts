import { graphqlRequest } from "@/services/graphQL/graphqlClient";
import type {
  NotificationItem as GQLNotificationItem,
  NotificationConnection,
  NotificationPreferencesType,
  NotificationCategory,
} from "@/src/types/__generated__/graphql";

export type NotificationItem = Omit<GQLNotificationItem, "__typename">;

export type NotificationsResponse = Omit<NotificationConnection, "__typename">;

export async function getNotifications(limit: number = 50, cursor?: string, category?: NotificationCategory): Promise<NotificationsResponse> {
  const query = `
    query MyNotifications($limit: Int, $cursor: String, $category: NotificationCategory) {
      notifications(limit: $limit, cursor: $cursor, category: $category) {
        hasMore
        nextCursor
        items {
          id
          title
          message
          type
          isRead
          referenceId
          referenceType
          deepLink
          destination {
            route
            deepLink
            entityType
            entityId
            secondaryEntityId
          }
          createdAt
          user {
            id
            username
            avatarUrl
            viewerState {
              isFollowing
              isFollowedBy
              isOwner
            }
          }
        }
      }
    }
  `;

  try {
    const data = await graphqlRequest(query, { limit, cursor, category });
    return data?.notifications ?? { items: [], hasMore: false, nextCursor: null };
  } catch {
    return { items: [], hasMore: false, nextCursor: null };
  }
}

export async function getUnreadNotificationCount(): Promise<number> {
  const query = `
    query UnreadCount {
      unreadNotificationCount
    }
  `;

  try {
    const data = await graphqlRequest(query, {});
    return data?.unreadNotificationCount ?? 0;
  } catch {
    return 0;
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const mutation = `
    mutation MarkRead($notificationId: ID!) {
      markNotificationAsRead(notificationId: $notificationId) {
        success
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
      }
    }
  `;

  const data = await graphqlRequest(mutation, {});
  return data?.markAllNotificationsAsRead?.success ?? false;
}

export async function deleteNotification(notificationId: string): Promise<boolean> {
  const mutation = `
    mutation DeleteNotification($notificationId: ID!) {
      deleteNotification(notificationId: $notificationId) {
        success
      }
    }
  `;

  const data = await graphqlRequest(mutation, { notificationId });
  return data?.deleteNotification?.success ?? false;
}

export type NotificationPreferences = Omit<NotificationPreferencesType, "__typename">;

export async function updateNotificationPreferences(
  preferences: NotificationPreferences
): Promise<NotificationPreferences | null> {
  const mutation = `
    mutation UpdatePrefs($preferences: PreferencesInput!) {
      updateNotificationPreferences(preferences: $preferences) {
        inAppLikes
        inAppComment
        inAppNewFollowers
        inAppMentionAndTags
        interactionLikes
        interactionComment
        interactionPostInteraction
        interactionNewFollower
        circleLikes
        circleAnchorPost
        circleComment
        circleFriendInteraction
        mutedUserIds
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
