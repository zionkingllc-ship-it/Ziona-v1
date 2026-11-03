import { graphqlRequest } from "@/services/graphQL/graphqlClient";
import { useAuthStore } from "@/store/useAuthStore";
import { useQuery } from "@tanstack/react-query";

import type { ProfileEditPolicy } from "@/utils/profileEditPolicy";

const PROFILE_EDIT_POLICY = `
  query ProfileEditPolicy {
    me {
      createdAt
      lastNameChange
      lastUsernameChange
      displayNameEditableUntil
      usernameEditableUntil
      usernameGraceChangesRemaining
    }
  }
`;

export function useProfileEditPolicy(userId?: string) {
  const token = useAuthStore((state) => state.tokens?.accessToken);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);
  return useQuery<ProfileEditPolicy>({
    queryKey: ["profileEditPolicy", userId],
    enabled: !!userId && !!token && !isBootstrapping,
    refetchOnMount: true,
    queryFn: async () => {
      const data = await graphqlRequest(PROFILE_EDIT_POLICY);
      return data.me as ProfileEditPolicy;
    },
  });
}

