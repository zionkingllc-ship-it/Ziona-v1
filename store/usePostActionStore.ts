import { create } from "zustand";

type State = {
  likedPosts: Record<string, boolean>;
  savedPosts: Record<string, boolean>;
  followedUsers: Record<string, boolean>;
  pendingLikes: Record<string, boolean>;
  pendingSaves: Record<string, boolean>;

  toggleLike: (postId: string, value: boolean) => void;
  toggleSave: (postId: string, value: boolean) => void;
  setLikePending: (postId: string, value: boolean) => void;
  setSavePending: (postId: string, value: boolean) => void;
  toggleFollow: (userId: string, value: boolean) => void;
};

export const usePostActionsStore = create<State>((set) => ({
  likedPosts: {},
  savedPosts: {},
  followedUsers: {},
  pendingLikes: {},
  pendingSaves: {},

  toggleLike: (postId, value) =>
    set((state) => ({
      likedPosts: {
        ...state.likedPosts,
        [postId]: value,
      },
    })),

  toggleSave: (postId, value) =>
    set((state) => ({
      savedPosts: {
        ...state.savedPosts,
        [postId]: value,
      },
    })),

  setLikePending: (postId, value) =>
    set((state) => ({
      pendingLikes: {
        ...state.pendingLikes,
        [postId]: value,
      },
    })),

  setSavePending: (postId, value) =>
    set((state) => ({
      pendingSaves: {
        ...state.pendingSaves,
        [postId]: value,
      },
    })),

  toggleFollow: (userId, value) =>
    set((state) => ({
      followedUsers: {
        ...state.followedUsers,
        [userId]: value,
      },
    })),
}));
