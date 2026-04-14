import { useEffect } from "react";
import { useBookmarkFolders } from "./useBookmarkSettings";
import { useBookmarksStore } from "@/store/useBookmarkStore";

export function useSyncBookmarkFolders() {
  const { data: apiFolders, isLoading, refetch } = useBookmarkFolders();
  const { setFolders } = useBookmarksStore();

  useEffect(() => {
    if (!apiFolders || !Array.isArray(apiFolders)) return;

    const mappedFolders = apiFolders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      cover: "",
      createdAt: folder.createdAt ?? new Date().toISOString(),
    }));

    setFolders(mappedFolders);
  }, [apiFolders, setFolders]);

  return { isLoading, refetch };
}
