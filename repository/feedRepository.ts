import { create } from "zustand";
import { FeedPost } from "@/types/feedTypes";

export type FeedStatus = "idle" | "loading" | "success" | "empty" | "error";

interface FeedState {
  data: FeedPost[];
  status: FeedStatus;
  error?: string;
  nextPage?: string;
  hasMore?: boolean;
}

interface FeedStore {
  forYou: FeedState;
  following: FeedState;

  setForYou: (data: Partial<FeedState>) => void;
  setFollowing: (data: Partial<FeedState>) => void;

  resetFeed: () => void;
}

const initialState: FeedState = {
  data: [],
  status: "idle",
  error: undefined,
  nextPage: undefined,
  hasMore: true,
};

export const useFeedStore = create<FeedStore>((set) => ({
  forYou: { ...initialState },
  following: { ...initialState },

  setForYou: (data) =>
    set((state) => ({
      forYou: {
        ...state.forYou,
        ...data,
      },
    })),

  setFollowing: (data) =>
    set((state) => ({
      following: {
        ...state.following,
        ...data,
      },
    })),

  resetFeed: () =>
    set({
      forYou: { ...initialState },
      following: { ...initialState },
    }),
})); 