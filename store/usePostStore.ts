import { create } from "zustand";

// Types for global actions
export interface LikeAction {
  postId: string;
  liked: boolean;
}

export interface BookmarkAction {
  postId: string;
  folderIds: string[];
}

export interface FlagAction {
  postId: string;
  flagged: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  text: string;
  createdAt: string;
}

interface PostActionsState {
  likes: Record<string, boolean>;          // postId -> liked
  bookmarks: Record<string, string[]>;    // postId -> folderIds
  flagged: Record<string, boolean>;       // postId -> flagged
  comments: Record<string, Comment[]>;    // postId -> array of comments

  toggleLike: (postId: string) => void;
  toggleFlag: (postId: string) => void;
  addBookmark: (postId: string, folderId: string) => void;
  removeBookmark: (postId: string, folderId: string) => void;
  addComment: (postId: string, text: string) => void;
}

export const usePostActionsStore = create<PostActionsState>((set, get) => ({
  likes: {},
  bookmarks: {},
  flagged: {},
  comments: {},

  toggleLike: (postId) => {
    set((state) => ({
      likes: {
        ...state.likes,
        [postId]: !state.likes[postId],
      },
    }));
  },

  toggleFlag: (postId) => {
    set((state) => ({
      flagged: {
        ...state.flagged,
        [postId]: !state.flagged[postId],
      },
    }));
  },

  addBookmark: (postId, folderId) => {
    set((state) => {
      const currentFolders = state.bookmarks[postId] || [];
      if (!currentFolders.includes(folderId)) {
        return {
          bookmarks: {
            ...state.bookmarks,
            [postId]: [...currentFolders, folderId],
          },
        };
      }
      return state;
    });
  },

  removeBookmark: (postId, folderId) => {
    set((state) => ({
      bookmarks: {
        ...state.bookmarks,
        [postId]: (state.bookmarks[postId] || []).filter((id) => id !== folderId),
      },
    }));
  },

  addComment: (postId, text) => {
    const comment: Comment = {
      id: Date.now().toString(),
      postId,
      text,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      comments: {
        ...state.comments,
        [postId]: [...(state.comments[postId] || []), comment],
      },
    }));
  },
}));