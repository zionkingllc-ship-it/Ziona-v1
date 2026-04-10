import { create } from "zustand";

type SignupFlow = "email" | "google" | null;

interface SignupState {
  email: string | null;
  birthday: string | null;
  password: string | null;
  suggestedUsernames: string[];
  selectedUsername: string | null;

  flow: SignupFlow;

  setFlow: (flow: SignupFlow) => void;
  setEmail: (email: string) => void;
  setBirthday: (birthday: string) => void;
  setPassword: (password: string) => void;
  setSuggestions: (suggestions: string[]) => void;
  setSelectedUsername: (username: string) => void;

  reset: () => void;
}

export const useSignupStore = create<SignupState>((set) => ({
  email: null,
  birthday: null,
  password: null,
  suggestedUsernames: [],
  selectedUsername: null,

  flow: null,

  setFlow: (flow) => set({ flow }),

  setEmail: (email) => set({ email }),
  setBirthday: (birthday) => set({ birthday }),
  setPassword: (password) => set({ password }),

  setSuggestions: (suggestions) =>
    set({ suggestedUsernames: suggestions ?? [] }),

  setSelectedUsername: (username) =>
    set({ selectedUsername: username }),

  reset: () =>
    set({
      email: null,
      birthday: null,
      password: null,
      suggestedUsernames: [],
      selectedUsername: null,
      flow: null,
    }),
}));