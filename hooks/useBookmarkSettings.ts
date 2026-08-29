import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBookmarkFolders,
  createBookmarkFolder,
  deleteBookmarkFolder,
  bulkRemoveBookmarks,
} from "@/services/graphQL/queries/actions/bookmarkFolders";
import { usePostActionsStore } from "@/store/usePostActionStore";

export { type BookmarkFolder, type BookmarkPost } from "@/services/graphQL/queries/actions/bookmarkFolders";

export function useBookmarkFolders() {
  return useQuery({
    queryKey: ["bookmarkFolders"],
    queryFn: async () => {
      try {
        const result = await getBookmarkFolders();
        return result;
      } catch (err) {
        console.error("🔍 [useBookmarkFolders] Query failed:", err);
        throw err;
      }
    },
  });
}

export function useCreateBookmarkFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBookmarkFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarkFolders"] });
    },
  });
}

export function useDeleteBookmarkFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBookmarkFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarkFolders"] });
    },
  });
}

export function useBulkRemoveBookmarks() {
  const queryClient = useQueryClient();
  const toggleSave = usePostActionsStore((s) => s.toggleSave);

  return useMutation({
    mutationFn: bulkRemoveBookmarks,
    onMutate: async (postIds) => {
      postIds.forEach((postId) => toggleSave(postId, false));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarkFolders"] });
      queryClient.invalidateQueries({ queryKey: ["userSavedPosts"] });
    },
    onError: (_err, postIds) => {
      postIds.forEach((postId) => toggleSave(postId, true));
    },
  });
}
