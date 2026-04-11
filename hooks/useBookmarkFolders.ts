import { useQuery } from "@tanstack/react-query";
import { getBookmarkFolders } from "@/services/graphQL/mutation/actions/bookmarks";

export function useBookmarkFolders() {
  return useQuery({
    queryKey: ["bookmarkFolders"],
    queryFn: getBookmarkFolders,
  });
}