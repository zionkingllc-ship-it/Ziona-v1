import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { graphqlRequest } from "@/services/graphQL/graphqlClient";

// Backend fields: likeNotifications, replyNotifications, anchorNotifications,
// circleActivityNotifications, adminAnnouncements
// UI fields (not yet in backend, will be wired when backend adds them):
// inAppLikes, inAppComment, inAppNewFollowers, inAppMention, inAppTabs,
// interactionLikes, interactionComment, interactionPostInteraction, interactionNewFollower,
// circleLikes, circleAnchorPost, circleComment, circleFriendInteraction

export type BackendPrefs = {
  likeNotifications: boolean;
  replyNotifications: boolean;
  anchorNotifications: boolean;
  circleActivityNotifications: boolean;
  adminAnnouncements: boolean;
};

const GET_NOTIFICATION_PREFS = `
query GetNotificationPreferences {
  notificationPreferences {
    likeNotifications
    replyNotifications
    anchorNotifications
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
      return (data?.notificationPreferences ?? null) as BackendPrefs | null;
    },
  });
}

const UPDATE_NOTIFICATION_PREFS = `
mutation UpdateNotificationPreferences($preferences: PreferencesInput!) {
  updateNotificationPreferences(preferences: $preferences) {
    likeNotifications
    replyNotifications
    anchorNotifications
    circleActivityNotifications
    adminAnnouncements
  }
}
`;

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: BackendPrefs) => {
      const data = await graphqlRequest(UPDATE_NOTIFICATION_PREFS, { preferences });
      return data?.updateNotificationPreferences as BackendPrefs;
    },
    onMutate: async (newPrefs) => {
      await queryClient.cancelQueries({ queryKey: ["notificationPreferences"] });
      const previous = queryClient.getQueryData(["notificationPreferences"]);
      queryClient.setQueryData(["notificationPreferences"], newPrefs);
      return { previous };
    },
    onError: (_err, _newPrefs, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["notificationPreferences"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationPreferences"] });
    },
  });
}