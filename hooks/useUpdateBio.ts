import { useMutation, useQueryClient } from "@tanstack/react-query";
import { graphqlRequest } from "@/services/graphQL/graphqlClient";
import { useAuthStore } from "@/store/useAuthStore";

type BioResponse = {
  id: string;
  bio?: string;
};

export function useUpdateBio() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: async (bio: string) => {
      console.log("SENDING BIO:", bio);

      const data = await graphqlRequest(
        `
        mutation UpdateProfile($bio: String!) {
          updateProfile(bio: $bio) {
            success
            user { id bio }
          }
        }
      `,
        { bio }
      );

      console.log("UPDATE BIO RESPONSE:", data);

      if (!data?.updateProfile?.success) {
        throw new Error("Failed to update bio");
      }

      return data.updateProfile.user as BioResponse;
    },

    onSuccess: (updatedUser) => {
      if (!userId) return;

      if (!updatedUser?.bio && updatedUser?.bio !== "") {
        console.log(" Backend returned invalid bio");
        return;
      }

      queryClient.setQueryData(
        ["userProfile", userId],
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            bio: updatedUser.bio,
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
    },
  });
}