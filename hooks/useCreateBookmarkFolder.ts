import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBookmarkFolder } from "@/services/graphQL/mutation/actions/bookmarks";

export function useCreateBookmarkFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => createBookmarkFolder(name),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bookmarkFolders"],
      });
    },
  });
}