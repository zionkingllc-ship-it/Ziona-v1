import { create } from "zustand";

type State = {
  likedPosts: Record<string, boolean>;
  savedPosts: Record<string, boolean>;
  followedUsers: Record<string, boolean>;

  toggleLike: (postId: string, value: boolean) => void;
  toggleSave: (postId: string, value: boolean) => void;

   
};

export const usePostActionsStore = create<State>((set) => ({
  likedPosts: {},
  savedPosts: {},
  followedUsers: {},

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
 
}));