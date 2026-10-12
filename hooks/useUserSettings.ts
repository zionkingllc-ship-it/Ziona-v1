import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { graphqlRequest } from "@/services/graphQL/graphqlClient";

export type BackendPrefs = {
  inAppLikes: boolean;
  inAppComment: boolean;
  inAppNewFollowers: boolean;
  inAppMentionAndTags: boolean;
  interactionLikes: boolean;
  interactionComment: boolean;
  interactionPostInteraction: boolean;
  interactionNewFollower: boolean;
  circleLikes: boolean;
  circleAnchorPost: boolean;
  circleComment: boolean;
  circleFriendInteraction: boolean;
};

const GET_NOTIFICATION_PREFS = `
query GetNotificationPreferences {
  notificationPreferences {
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