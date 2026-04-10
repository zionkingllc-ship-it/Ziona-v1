import { useMutation, useQueryClient } from "@tanstack/react-query";
import { graphqlRequest } from "@/services/graphQL/graphqlClient";
import { useAuthStore } from "@/store/useAuthStore";

/* =========================
   UPDATE AVATAR
========================= */

const UPDATE_AVATAR = `
mutation UpdateProfile($avatarUrl: String!) {
  updateProfile(avatarUrl: $avatarUrl) {
    success
    user {
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
    mutationFn: async (file: { uri: string }) => {
      const avatarUrl = file.uri;

      console.log("SENDING AVATAR TO BACKEND:", avatarUrl);

      const data = await graphqlRequest(UPDATE_AVATAR, {
        avatarUrl,
      });

      console.log("UPDATE AVATAR RESPONSE:", data);

      if (!data?.updateProfile?.success) {
        throw new Error("Backend failed to update avatar");
      }

      return data.updateProfile.user as AvatarResponse;
    },

    onSuccess: (updatedUser) => {
      if (!userId) return;

      if (!updatedUser?.avatarUrl) {
        console.log("Backend returned empty avatarUrl");
        return;
      }

      queryClient.setQueryData(
        ["userProfile", userId],
        (old: any) => ({
          ...old,
          avatarUrl: updatedUser.avatarUrl,
        })
      );

      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["discoverFeed"] });
    },
  });
}