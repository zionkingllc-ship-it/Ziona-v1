import { useMutation, useQueryClient } from "@tanstack/react-query";
import { graphqlRequest } from "@/services/graphQL/graphqlClient";
import { useAuthStore } from "@/store/useAuthStore";

type BioResponse = {
  bio?: string | null;
};

export function useUpdateBio() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: async (bio: string) => {
      const data = await graphqlRequest(
        `
        mutation UpdateProfile($bio: String!) {
          updateProfile(bio: $bio) {
            success
            profile {
              bio
            }
            error { code message }
          }
        }
        `,
        { bio }
      );

      const res = data?.updateProfile;

      if (!res?.success) {
        throw new Error(res?.error?.message || "Failed to update bio");
      }

      return res.profile as BioResponse; // ✅ FIXED
    },

    onSuccess: (profile) => {
      if (!userId) return;

      queryClient.setQueryData(
        ["userProfile", userId],
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            bio: profile?.bio ?? "",
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
    },
  });
}