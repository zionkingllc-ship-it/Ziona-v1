import { useState } from "react";
import { useToggleSave } from "./useToggleSave";

export function useBookmarkFlow(postId: string, isSaved: boolean) {
  const [foldersVisible, setFoldersVisible] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);

  const toggleSaveMutation = useToggleSave();

  /* ================= ACTIONS ================= */

  const openFolders = () => setFoldersVisible(true);

  const toggleFolder = (folderId?: string) => {
    toggleSaveMutation.mutate({
      postId,
      currentSaved: isSaved,
      folderId,
    });

    setFoldersVisible(false);
  };

  const createFolder = (name: string) => {
    console.log("Create folder:", name);
    setCreateVisible(false);
  };

  return {
    foldersVisible,
    createVisible,
    openFolders,
    setFoldersVisible,
    setCreateVisible,
    toggleFolder,
    createFolder,
  };
}