import { useInfiniteQuery } from "@tanstack/react-query";
import { getSavedPosts } from "@/services/graphQL/queries/actions/savedPosts";

interface UseUserSavedPostsOptions {
  folderId?: string;
  mediaType?: string;
  limit?: number;
  enabled?: boolean;
}

export function useUserSavedPosts({
  folderId,
  mediaType,
  limit = 20,
  enabled = true,
}: UseUserSavedPostsOptions = {}) {
  return useInfiniteQuery({
    queryKey: ["userSavedPosts", folderId, mediaType],
    enabled,

    initialPageParam: undefined as string | undefined,

    queryFn: async ({ pageParam }) => {
      return getSavedPosts(folderId, mediaType, pageParam, limit);
    },

    getNextPageParam: (lastPage) => {
      return lastPage?.hasMore ? lastPage.nextCursor : undefined;
    },
  });
}
