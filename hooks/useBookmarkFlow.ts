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
    updateFolderCover,
    folders: localFolders,
  } = useBookmarksStore();

  /* ================= ACTIONS ================= */

  const openFolders = () => {
    setFoldersVisible(true);
  };

  const toggleFolder = (
    folderId?: string,
    callbacks?: { onSuccess?: () => void; onError?: () => void },
    coverUri?: string,
  ) => {
    if (!folderId) return;

    toggleLocalBookmark(postId, folderId);

    if (coverUri) {
      updateFolderCover(folderId, coverUri);
    }

    toggleSaveMutation.mutate(
      {
        postId,
        currentSaved: isSaved,
        folderId,
      },
      {
        onSuccess: () => {
          callbacks?.onSuccess?.();
        },
        onError: () => {
          toggleLocalBookmark(postId, folderId);
          callbacks?.onError?.();
        },
      },
    );

    setFoldersVisible(false);
  };

  const createFolder = (
    name: string,
    thumbnailUri?: string | null,
    callbacks?: { onSuccess?: () => void; onError?: () => void },
  ) => {
    createFolderMutation.mutate(
      { name },
      {
        onSuccess: (newFolder) => {
          const folderId = newFolder?.folder?.id;
          if (!folderId) {
            callbacks?.onError?.();
            return;
          }
          const nextFolders = [
            ...localFolders,
            {
              id: folderId,
              name,
              cover: thumbnailUri || "",
              createdAt: new Date().toISOString(),
            },
          ];
          setFolders(nextFolders);

        toggleLocalBookmark(postId, folderId);
        toggleSaveMutation.mutate(
          {
            postId,
            currentSaved: false,
            folderId,
          },
          {
            onSuccess: () => {
              setCreateVisible(false);
              callbacks?.onSuccess?.();
            },
            onError: () => {
              toggleLocalBookmark(postId, folderId);
              callbacks?.onError?.();
            },
          },
        );
        },
        onError: () => {
          callbacks?.onError?.();
        },
      },
    );
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
