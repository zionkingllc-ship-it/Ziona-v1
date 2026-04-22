import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBookmarkFolder } from "@/services/graphQL/mutation/actions/bookmarks";

export function useCreateBookmarkFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, cover }: { name: string; cover?: string }) =>
      createBookmarkFolder(name, cover),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bookmarkFolders"],
      });
    },
  });
}