import { create } from "zustand";
import { Folder, Bookmark } from "@/types/folder";

interface BookmarkState {
  folders: Folder[];
  bookmarks: Bookmark[];

  createFolder: (name: string, cover: string, postId?: string) => void;
  toggleBookmark: (postId: string, folderId: string) => void;
  getSavedFolderIds: (postId: string) => string[];
}

export const useBookmarksStore = create<BookmarkState>((set, get) => ({
  folders: [
    {
      id: "1", 
      name: "All",
      cover: "https://picsum.photos/200",
      createdAt: new Date().toISOString(),
    },
  ],

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

  toggleBookmark: (postId, folderId) => {
    const existing = get().bookmarks.find(
      (b) => b.postId === postId && b.folderId === folderId
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
}));