import { useBookmarksStore } from "@/store/useBookmarkStore";
import { useEffect } from "react";
import { useSavedPosts } from "./useSavedPosts";

export function useSyncSavedPosts() {
  const { data: apiBookmarks, isLoading } = useSavedPosts();
  const { setBookmarks } = useBookmarksStore();

  useEffect(() => {
    if (!apiBookmarks?.posts) return;

    const mappedBookmarks = apiBookmarks.posts.map((bookmark) => ({
      id: bookmark.id,
      type: bookmark.type,
      author: bookmark.author,
      stats: bookmark.stats,
      viewerState: bookmark.viewerState,
      shareUrl: bookmark.shareUrl,
      createdAt: bookmark.createdAt,
      scripture: bookmark.scripture,
      caption: bookmark.caption,
      textMessage: bookmark.textMessage,
      bibleMessage: bookmark.bibleMessage,
      image: bookmark.image,
      video: bookmark.video,
      category: bookmark.category,
    }));

    setBookmarks(mappedBookmarks);
  }, [apiBookmarks, setBookmarks]);

  return { isLoading };
}
