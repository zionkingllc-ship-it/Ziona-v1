import { useMutation, useQueryClient } from "@tanstack/react-query";
import { graphqlRequest } from "@/services/graphQL/graphqlClient";
import { useAuthStore } from "@/store/useAuthStore";
import { UserProfile } from "@/types/userProfile";
import { updateAvatar } from "@/services/profile/profileService";

/* =========================
   UPDATE AVATAR
========================= */

const UPDATE_AVATAR = `
mutation UpdateProfile($avatarUrl: String!) {
  updateProfile(id: $userId, avatarUrl: $avatarUrl) {
    success
    profile {
      id
      avatarUrl
    }
  }
}
`;

type AvatarResponse = {
  id: string;
  avatarUrl?: string;
};

export function useUpdateAvatar() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: updateAvatar,

    onSuccess: (avatarUrl: string | null) => {
      if (!userId || !avatarUrl) return;

      queryClient.setQueryData(
        ["userProfile", userId],
        (prev: UserProfile | null) => {
          if (!prev) return prev;

          return {
            ...prev,
            avatarUrl,
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
      queryClient.invalidateQueries({ queryKey: ["forYouFeed"] });
      queryClient.invalidateQueries({ queryKey: ["followingFeed"] });
    },
  });
}