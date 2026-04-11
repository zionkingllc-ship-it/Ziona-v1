import { getSavedPosts } from "@/services/graphQL/queries/actions/bookmarks";
import { useQuery } from "@tanstack/react-query";

export function useSavedPosts() {
  return useQuery({
    queryKey: ["savedPosts"],
    queryFn: getSavedPosts,
  });
}
