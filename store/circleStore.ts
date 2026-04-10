import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface CircleState {
  hasSeenIntro: boolean;
  setSeenIntro: () => Promise<void>;
  loadSeenIntro: () => Promise<void>;
}

export const useCircleStore = create<CircleState>((set) => ({
  hasSeenIntro: false,

  loadSeenIntro: async () => {
    try {
      const value = await AsyncStorage.getItem("seenCirclesIntro");
      set({ hasSeenIntro: value === "true" });
    } catch (err) {
      console.error("Failed to load intro state", err);
    }
  },

  setSeenIntro: async () => {
    try {
      await AsyncStorage.setItem("seenCirclesIntro", "true");
      set({ hasSeenIntro: true });
    } catch (err) {
      console.error("Failed to save intro state", err);
    }
  },
}));