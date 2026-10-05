import { create } from "zustand";

interface LikeState {
  isLiked: boolean;
  likeCount: number;
}

interface CirclePostLikeStore {
  likes: Record<string, LikeState>;
  setLike: (postId: string, state: LikeState) => void;
  optimisticToggle: (postId: string, current: LikeState) => void;
}

export const useCirclePostLikeStore = create<CirclePostLikeStore>((set) => ({
  likes: {},
  setLike: (postId, state) =>
    set((s) => ({ likes: { ...s.likes, [postId]: state } })),
  optimisticToggle: (postId, current) =>
    set((s) => ({
      likes: {
        ...s.likes,
        [postId]: {
          isLiked: !current.isLiked,
          likeCount: current.isLiked
            ? Math.max(0, current.likeCount - 1)
            : current.likeCount + 1,
        },
      },
    })),
}));
