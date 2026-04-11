import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBookmarkFolder } from "@/services/graphQL/mutation/actions/bookmarks";

export function useDeleteBookmarkFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (folderId: string) => deleteBookmarkFolder(folderId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bookmarkFolders"],
      });
    },
  });
}