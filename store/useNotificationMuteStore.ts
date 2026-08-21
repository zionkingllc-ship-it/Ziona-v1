import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface NotificationMuteState {
  mutedUserIds: string[];
  muteUser: (userId: string) => void;
  unmuteUser: (userId: string) => void;
  toggleMuteUser: (userId: string) => void;
}

export const useNotificationMuteStore = create<NotificationMuteState>()(
  persist(
    (set, get) => ({
      mutedUserIds: [],

      muteUser: (userId) => {
        if (!userId) return;
        set((state) => ({
          mutedUserIds: Array.from(new Set([...state.mutedUserIds, userId])),
        }));
      },

      unmuteUser: (userId) => {
        set((state) => ({
          mutedUserIds: state.mutedUserIds.filter((id) => id !== userId),
        }));
      },

      toggleMuteUser: (userId) => {
        if (!userId) return;
        const { mutedUserIds } = get();
        if (mutedUserIds.includes(userId)) {
          set({ mutedUserIds: mutedUserIds.filter((id) => id !== userId) });
        } else {
          set({ mutedUserIds: Array.from(new Set([...mutedUserIds, userId])) });
        }
      },
    }),
    {
      name: "muted_notification_users",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ mutedUserIds: state.mutedUserIds }),
    },
  ),
);