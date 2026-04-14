import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBookmarkFolders,
  createBookmarkFolder,
  deleteBookmarkFolder,
  bulkRemoveBookmarks,
} from "@/services/graphQL/queries/actions/bookmarkFolders";

export { type BookmarkFolder, type BookmarkPost } from "@/services/graphQL/queries/actions/bookmarkFolders";

export function useBookmarkFolders() {
  return useQuery({
    queryKey: ["bookmarkFolders"],
    queryFn: getBookmarkFolders,
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

  return useMutation({
    mutationFn: bulkRemoveBookmarks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarkFolders"] });
    },
  });
}
