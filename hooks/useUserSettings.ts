import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { graphqlRequest } from "@/services/graphQL/graphqlClient";
import type {
  NotificationPreferencesType,
  PreferencesInput,
} from "@/src/types/__generated__/graphql";
import type { Maybe, Scalars } from "@/src/types/__generated__/graphql";

const GET_NOTIFICATION_PREFS = `
query GetNotificationPreferences {
  notificationPreferences {
    anchorNotifications
    replyNotifications
    likeNotifications
    circleActivityNotifications
    adminAnnouncements
  }
}
`;

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ["notificationPreferences"],
    queryFn: async () => {
      const data = await graphqlRequest(GET_NOTIFICATION_PREFS);
      return data?.notificationPreferences as NotificationPreferencesType;
    },
  });
}

const UPDATE_NOTIFICATION_PREFS = `
mutation UpdateNotificationPreferences($preferences: PreferencesInput!) {
  updateNotificationPreferences(preferences: $preferences) {
    anchorNotifications
    replyNotifications
    likeNotifications
    circleActivityNotifications
    adminAnnouncements
  }
}
`;

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: PreferencesInput) => {
      const data = await graphqlRequest(UPDATE_NOTIFICATION_PREFS, { preferences });
      return data?.updateNotificationPreferences as NotificationPreferencesType;
    },
    onSuccess: (newPrefs) => {
      queryClient.setQueryData(["notificationPreferences"], newPrefs);
    },
  });
}