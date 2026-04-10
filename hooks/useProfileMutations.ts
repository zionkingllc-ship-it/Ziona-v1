import { updateAvatar, updateProfile } from "@/services/profile/profileService";
import { useAuthStore } from "@/store/useAuthStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserProfile } from "@/types/userProfile";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: updateProfile,

    onSuccess: (user: Partial<UserProfile>) => {
      if (!userId) return;

      queryClient.setQueryData(
        ["userProfile", userId],
        (prev: UserProfile | null) => {
          if (!prev) return prev;
          return { ...prev, ...user };
        }
      );

      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
    },
  });
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: updateAvatar,

    onSuccess: (avatarUrl: string) => {
      if (!userId) return;

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