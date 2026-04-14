import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { graphqlRequest } from "@/services/graphQL/graphqlClient";

/* =========================
   GET USER SETTINGS
 ========================= */

const GET_USER_SETTINGS = `
query GetUserSettings {
  userSettings {
    notifications {
      likes
      comments
      followers
      postInteraction
      circleLikes
      circleComments
      circleAnchors
      circleFriends
    }
    privacy {
      privateAccount
      allowTagging
      allowMessages
    }
    likeCountVisible
  }
}
`;

type NotificationSettings = {
  likes: boolean;
  comments: boolean;
  followers: boolean;
  postInteraction: boolean;
  circleLikes: boolean;
  circleComments: boolean;
  circleAnchors: boolean;
  circleFriends: boolean;
};

type PrivacySettings = {
  privateAccount: boolean;
  allowTagging: boolean;
  allowMessages: boolean;
};

type UserSettings = {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  likeCountVisible: boolean;
};

async function fetchUserSettings() {
  const data = await graphqlRequest(GET_USER_SETTINGS);
  return data?.userSettings as UserSettings;
}

export function useUserSettings() {
  return useQuery({
    queryKey: ["userSettings"],
    queryFn: fetchUserSettings,
  });
}

/* =========================
   UPDATE NOTIFICATION PREFERENCES
 ========================= */

const UPDATE_NOTIFICATION_PREFS = `
mutation UpdateNotificationPreferences($preferences: PreferencesInput!) {
  updateNotificationPreferences(preferences: $preferences) {
    likes
    comments
    followers
    postInteraction
    circleLikes
    circleComments
    circleAnchors
    circleFriends
  }
}
`;

export function useUpdateNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: NotificationSettings) => {
      const data = await graphqlRequest(UPDATE_NOTIFICATION_PREFS, { preferences });
      return data?.updateNotificationPreferences as NotificationSettings;
    },
    onSuccess: (newSettings) => {
      queryClient.setQueryData(["userSettings"], (prev: UserSettings | undefined) => {
        if (!prev) return prev;
        return { ...prev, notifications: newSettings };
      });
    },
  });
}

/* =========================
   UPDATE PRIVACY SETTINGS
 ========================= */

const UPDATE_PRIVACY = `
mutation UpdatePrivacySettings($input: PrivacySettingsInput!) {
  updatePrivacySettings(input: $input) {
    success
    settings {
      privateAccount
      allowTagging
      allowMessages
    }
    error { code message }
  }
}
`;

export function useUpdatePrivacy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PrivacySettings) => {
      const data = await graphqlRequest(UPDATE_PRIVACY, { input });
      const res = data?.updatePrivacySettings;
      if (!res?.success) {
        throw new Error(res?.error?.message || "Failed to update privacy");
      }
      return res.settings;
    },
    onSuccess: (newSettings) => {
      queryClient.setQueryData(["userSettings"], (prev: UserSettings | undefined) => {
        if (!prev) return prev;
        return { ...prev, privacy: newSettings };
      });
    },
  });
}

/* =========================
   UPDATE LIKE COUNT VISIBILITY
 ========================= */

const UPDATE_LIKE_COUNT = `
mutation UpdateLikeCountVisibility($visible: Boolean!) {
  updateLikeCountVisibility(visible: $visible) {
    success
    visible
    error { code message }
  }
}
`;

export function useUpdateLikeCountVisibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (visible: boolean) => {
      const data = await graphqlRequest(UPDATE_LIKE_COUNT, { visible });
      const res = data?.updateLikeCountVisibility;
      if (!res?.success) {
        throw new Error(res?.error?.message || "Failed to update like count visibility");
      }
      return res.visible;
    },
    onSuccess: (visible) => {
      queryClient.setQueryData(["userSettings"], (prev: UserSettings | undefined) => {
        if (!prev) return prev;
        return { ...prev, likeCountVisible: visible };
      });
    },
  });
}