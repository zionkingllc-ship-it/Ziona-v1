import { useInfiniteQuery } from "@tanstack/react-query";
import { getSavedPosts } from "@/services/graphQL/queries/actions/savedPosts";

interface UseUserSavedPostsOptions {
  folderId?: string;
  mediaType?: string;
  limit?: number;
}

export function useUserSavedPosts({
  folderId,
  mediaType,
  limit = 20,
}: UseUserSavedPostsOptions = {}) {
  return useInfiniteQuery({
    queryKey: ["userSavedPosts", folderId, mediaType],

    initialPageParam: undefined as string | undefined,

    queryFn: async ({ pageParam }) => {
      return getSavedPosts(folderId, mediaType, pageParam, limit);
    },

    getNextPageParam: (lastPage) => {
      return lastPage?.hasMore ? lastPage.nextCursor : undefined;
    },
  });
}
