import { useState } from "react";
import { useToggleSave } from "./useToggleSave";
import { useCreateBookmarkFolder } from "./useCreateBookmarkFolder";
import { useBookmarksStore } from "@/store/useBookmarkStore";
import { useBookmarkFolders } from "./useBookmarkSettings";

export function useBookmarkFlow(postId: string, isSaved: boolean) {
  const [foldersVisible, setFoldersVisible] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);

  const toggleSaveMutation = useToggleSave();
  const createFolderMutation = useCreateBookmarkFolder();
  const {
    toggleBookmark: toggleLocalBookmark,
    setFolders,
    folders: localFolders,
  } = useBookmarksStore();

  /* ================= ACTIONS ================= */

  const openFolders = () => {
    setFoldersVisible(true);
  };

  const toggleFolder = (folderId?: string) => {
    if (!folderId) return;

    toggleLocalBookmark(postId, folderId);
    toggleSaveMutation.mutate(
      {
        postId,
        currentSaved: isSaved,
        folderId,
      },
      {
        onError: () => {
          toggleLocalBookmark(postId, folderId);
        },
      },
    );

    setFoldersVisible(false);
  };

  const createFolder = (name: string) => {
    createFolderMutation.mutate(
      { name },
      {
        onSuccess: (newFolder) => {
          const folderId = newFolder?.folder?.id;
          if (!folderId) return;
          const nextFolders = [
            ...localFolders,
            {
              id: folderId,
              name,
              cover: "",
              createdAt: new Date().toISOString(),
            },
          ];
          setFolders(nextFolders);

        // Save the post to the new folder
        toggleLocalBookmark(postId, folderId);
        toggleSaveMutation.mutate(
          {
            postId,
            currentSaved: isSaved,
            folderId,
          },
          {
            onError: () => {
              toggleLocalBookmark(postId, folderId);
            },
          },
        );
        setCreateVisible(false);
      },
    });
  };

  return {
    foldersVisible,
    createVisible,
    openFolders,
    setFoldersVisible,
    setCreateVisible,
    toggleFolder,
    createFolder,
    isCreating: createFolderMutation.isPending,
  };
}
