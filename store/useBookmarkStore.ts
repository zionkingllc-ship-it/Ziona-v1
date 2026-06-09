import { Bookmark, Folder } from "@/types/folder";
import { create } from "zustand";

interface BookmarkState {
  folders: Folder[];
  bookmarks: Bookmark[];

  createFolder: (name: string, cover: string, postId?: string) => void;
  toggleBookmark: (postId: string, folderId: string) => void;
  getSavedFolderIds: (postId: string) => string[];
  deleteFolder: (folderId: string) => void;
  removeBookmarks: (postIds: string[], folderId?: string) => void;
  setFolders: (folders: Folder[]) => void;
  setBookmarks: (bookmarks: Bookmark[]) => void;
}

export const useBookmarksStore = create<BookmarkState>((set, get) => ({
  folders: [],

  bookmarks: [],

  createFolder: (name, cover, postId) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      cover,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      folders: [...state.folders, newFolder],
    }));

    if (postId) {
      get().toggleBookmark(postId, newFolder.id);
    }
  },

  deleteFolder: (folderId: string) => {
    set((state) => ({
      folders: state.folders.filter((f) => f.id !== folderId),
      bookmarks: state.bookmarks.filter((b) => b.folderId !== folderId),
    }));
  },

  removeBookmarks: (postIds: string[], folderId?: string) => {
    set((state) => ({
      bookmarks: state.bookmarks.filter((b) => {
        if (folderId && postIds.includes(b.postId) && b.folderId === folderId) return false;
        if (!folderId && postIds.includes(b.postId)) return false;
        return true;
      }),
    }));
  },

  toggleBookmark: (postId, folderId) => {
    const existing = get().bookmarks.find(
      (b) => b.postId === postId && b.folderId === folderId,
    );

    if (existing) {
      set((state) => ({
        bookmarks: state.bookmarks.filter((b) => b.id !== existing.id),
      }));
    } else {
      const newBookmark: Bookmark = {
        id: Date.now().toString(),
        postId,
        folderId,
        createdAt: new Date().toISOString(),
      };

      set((state) => ({
        bookmarks: [...state.bookmarks, newBookmark],
      }));
    }
  },

  getSavedFolderIds: (postId) => {
    return get()
      .bookmarks.filter((b) => b.postId === postId)
      .map((b) => b.folderId);
  },

  setFolders: (folders) => {
    set({ folders });
  },

  setBookmarks: (bookmarks) => {
    set({ bookmarks });
  },
}));
