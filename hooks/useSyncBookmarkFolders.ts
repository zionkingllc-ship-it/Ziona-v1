import { useEffect } from "react";
import { useBookmarkFolders } from "./useBookmarkFolders";
import { useBookmarksStore } from "@/store/useBookmarkStore";

export function useSyncBookmarkFolders() {
  const { data: apiFolders, isLoading } = useBookmarkFolders();
  const { folders, setFolders } = useBookmarksStore();

  useEffect(() => {
    if (!apiFolders) return;

    const mappedFolders = apiFolders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      cover: folder.cover ?? "",
      createdAt: folder.createdAt ?? new Date().toISOString(),
    }));

    const hasAllFolder = mappedFolders.some((f) => f.name === "All");
    const foldersToSet = hasAllFolder
      ? mappedFolders
      : [
          {
            id: "all",
            name: "All",
            cover: "https://picsum.photos/200",
            createdAt: new Date().toISOString(),
          },
          ...mappedFolders,
        ];

    setFolders(foldersToSet);
  }, [apiFolders, setFolders]);

  return { isLoading };
}
