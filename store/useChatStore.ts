import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ChatMessage {
  id?: string;
  text: string;
  fromUser: boolean;
  sentAt?: string;
}

interface ChatStore {
  mode: "input" | "chat";
  messages: ChatMessage[];
  ticketId: string;
  setConversation: (messages: ChatMessage[], ticketId: string) => void;
  addMessage: (msg: ChatMessage) => void;
  mergeServerMessages: (msgs: ChatMessage[]) => void;
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
      mergeServerMessages: (msgs) =>
        set((s) => {
          const existingIds = new Set(s.messages.filter((m) => m.id).map((m) => m.id));
          const newMsgs = msgs.filter((m) => m.id && !existingIds.has(m.id));
          if (newMsgs.length === 0) return s;
          return { messages: [...s.messages, ...newMsgs] };
        }),
      clear: () =>
        set({ mode: "input", messages: [], ticketId: "" }),
    }),
    {
      name: "ziona-chat",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
