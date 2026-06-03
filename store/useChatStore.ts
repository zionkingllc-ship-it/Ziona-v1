import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ChatMessage {
  text: string;
  fromUser: boolean;
}

interface ChatStore {
  mode: "input" | "chat";
  messages: ChatMessage[];
  ticketId: string;
  setConversation: (messages: ChatMessage[], ticketId: string) => void;
  addMessage: (msg: ChatMessage) => void;
  clear: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      mode: "input",
      messages: [],
      ticketId: "",
      setConversation: (messages, ticketId) =>
        set({ mode: "chat", messages, ticketId }),
      addMessage: (msg) =>
        set((s) => ({ messages: [...s.messages, msg] })),
      clear: () =>
        set({ mode: "input", messages: [], ticketId: "" }),
    }),
    {
      name: "ziona-chat",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
