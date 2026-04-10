// store/useAsyncStore.ts
import { create } from "zustand";

type AsyncStore = {
  loadingMap: Record<string, boolean>;
  start: (key: string) => void;
  stop: (key: string) => void;
  isLoading: (key: string) => boolean;
};

export const useAsyncStore = create<AsyncStore>((set, get) => ({
  loadingMap: {},

  start: (key) =>
    set((state) => ({
      loadingMap: { ...state.loadingMap, [key]: true },
    })),

  stop: (key) =>
    set((state) => ({
      loadingMap: { ...state.loadingMap, [key]: false },
    })),

  isLoading: (key) => !!get().loadingMap[key],
}));