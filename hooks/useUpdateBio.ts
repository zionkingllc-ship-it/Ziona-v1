import { updateProfile } from "@/services/profile/profileService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";

export function useUpdateBio() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: async (bio: string) => {
      const result = await updateProfile({ bio });
      return result;
    },

    onMutate: async (newBio) => {
      if (!userId) return;

      await queryClient.cancelQueries({ queryKey: ["userProfile", userId] });

      const previousData = queryClient.getQueryData(["userProfile", userId]);

      queryClient.setQueryData(
        ["userProfile", userId],
        (old: any) => (old ? { ...old, bio: newBio } : old)
      );

      return { previousData };
    },

    onError: (_err, _newBio, context) => {
      if (!userId || !context?.previousData) return;

      queryClient.setQueryData(
        ["userProfile", userId],
        context.previousData
      );
    },

    onSettled: () => {
      if (!userId) return;
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
    },
  });
}
