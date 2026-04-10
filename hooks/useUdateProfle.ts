import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "@/services/graphQL/profile/profile";
import { useAuthStore } from "@/store/useAuthStore";
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