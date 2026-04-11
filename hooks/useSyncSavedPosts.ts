import { useBookmarksStore } from "@/store/useBookmarkStore";
import { useEffect } from "react";
import { useSavedPosts } from "./useSavedPosts";

export function useSyncSavedPosts() {
  const { data: apiBookmarks, isLoading } = useSavedPosts();
  const { setBookmarks } = useBookmarksStore();

  useEffect(() => {
    if (!apiBookmarks) return;

    const mappedBookmarks = apiBookmarks.map((bookmark) => ({
      id: bookmark.id,
      postId: bookmark.postId,
      folderId: bookmark.folderId,
    }));

    setBookmarks(mappedBookmarks);
  }, [apiBookmarks, setBookmarks]);

  return { isLoading };
}
