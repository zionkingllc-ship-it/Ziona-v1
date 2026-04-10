import { create } from "zustand";
import { FeedPost } from "@/types/feedTypes";

interface ViewerStore {
  feeds: Record<string, FeedPost[]>;

  setFeed: (key: string, posts: FeedPost[]) => void;
  getFeed: (key: string) => FeedPost[];

  clearFeed: (key: string) => void;
  resetAll: () => void;
}

export const useViewerStore = create<ViewerStore>((set, get) => ({
  feeds: {},

  setFeed: (key, posts) =>
    set((state) => ({
      feeds: {
        ...state.feeds,
        [key]: posts,
      },
    })),

  getFeed: (key) => {
    return get().feeds[key] ?? [];
  },

  clearFeed: (key) =>
    set((state) => {
      const updated = { ...state.feeds };
      delete updated[key];
      return { feeds: updated };
    }),

  resetAll: () => set({ feeds: {} }),
}));