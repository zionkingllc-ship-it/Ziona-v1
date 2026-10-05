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
          const incomingById = new Map<string, ChatMessage>();
          msgs.forEach((m) => m.id && incomingById.set(m.id, m));

          const next: ChatMessage[] = [];
          const seen = new Set<string>();

          const handleOptimistic = (m: ChatMessage) => {
            const matched = msgs.find(
              (im) => im.id && im.fromUser === m.fromUser && im.text === m.text
            );
            if (matched?.id) {
              if (!seen.has(matched.id)) {
                seen.add(matched.id);
                next.push(matched);
              }
            } else {
              next.push(m);
            }
          };

          for (const m of s.messages) {
            if (m.id) {
              if (incomingById.has(m.id) && !seen.has(m.id)) {
                seen.add(m.id);
                next.push(incomingById.get(m.id)!);
              } else if (!seen.has(m.id)) {
                next.push(m);
              }
            } else {
              handleOptimistic(m);
            }
          }

          for (const m of msgs) {
            if (m.id && !seen.has(m.id)) {
              seen.add(m.id);
              next.push(m);
            }
          }

          return { messages: next };
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
