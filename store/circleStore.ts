import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface CircleState {
  hasSeenIntro: boolean;
  setSeenIntro: () => void;
}

export const useCircleStore = create<CircleState>()(
  persist(
    (set) => ({
      hasSeenIntro: false,
      setSeenIntro: () => set({ hasSeenIntro: true }),
    }),
    {
      name: "circles-intro",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
