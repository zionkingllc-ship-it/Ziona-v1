import { Category } from "@/types/category";
import { BibleVerse, CreatePostDraft, MediaItem } from "@/types/createPost";

import { create } from "zustand";

type StartDraftType = "TEXT" | "MEDIA" | "BIBLE";

interface CreatePostState {
  draft: CreatePostDraft | null;

  startDraft: (type: StartDraftType, mediaType?: "IMAGE" | "VIDEO") => void;

  setText: (text: string) => void;

  setMedia: (items: MediaItem[]) => void;

  setCategory: (category: Category) => void;

  setBibleVerse: (bible: BibleVerse) => void;

  setCaption: (caption: string) => void;

  resetDraft: () => void;
}

const MAX_LENGTH = 500;

export const useCreatePostStore = create<CreatePostState>((set) => ({
  draft: null,

  /* =========================
     START DRAFT
  ========================= */

  startDraft: (type, mediaType) =>
    set((state) => {
      const prevText =
        state.draft?.type === "TEXT"
          ? state.draft.text ?? ""
          : "";

      const prevCategory = state.draft?.category;

      if (type === "TEXT") {
        return {
          draft: {
            type: "TEXT",
            text: prevText,
            category: prevCategory ?? ({} as Category),
          },
        };
      }

      if (type === "MEDIA") {
        if (!mediaType) throw new Error("mediaType required");

        return {
          draft: {
            type: "MEDIA",
            mediaType,
            media: { items: [] },
            category: prevCategory ?? ({} as Category),
          },
        };
      }

      if (type === "BIBLE") {
        return {
          draft: {
            type: "BIBLE",
            bibleVerse:
              state.draft?.type === "BIBLE"
                ? state.draft.bibleVerse
                : ({} as BibleVerse),

            //  NO TEXT IN BIBLE POSTS
            category: state.draft?.category ?? ({} as Category),
          },
        };
      }

      return { draft: state.draft };
    }),

  /* =========================
     TEXT
  ========================= */

  setText: (text) =>
    set((state) => {
      if (!state.draft) return state;

      if (text.length > MAX_LENGTH) return state;

      if (state.draft.type === "TEXT") {
        return {
          draft: { ...state.draft, text },
        };
      }

      // BIBLE should NOT accept text
      return state;
    }),

  /* =========================
     MEDIA
  ========================= */

  setMedia: (items) =>
    set((state) => {
      if (!state.draft || state.draft.type !== "MEDIA") return state;

      return {
        draft: {
          ...state.draft,
          media: { items },
        },
      };
    }),

  /* =========================
     CATEGORY
  ========================= */

  setCategory: (category) =>
    set((state) => {
      if (!state.draft) return state;

      return {
        draft: {
          ...state.draft,
          category,
        },
      };
    }),

  /* =========================
     BIBLE
  ========================= */

  setBibleVerse: (bible) =>
    set((state) => {
      if (!state.draft) return state;

      /* ================= TEXT ================= */
      if (state.draft.type === "TEXT") {
        return {
          draft: {
            ...state.draft,
            bibleVerse: bible, // ✅ ADD, DO NOT SWITCH TYPE
          },
        };
      }

      /* ================= BIBLE ================= */
      if (state.draft.type === "BIBLE") {
        return {
          draft: {
            ...state.draft,
            bibleVerse: bible,
          },
        };
      }

      return state;
    }),

  /* =========================
     CAPTION (MEDIA ONLY)
  ========================= */

  setCaption: (caption: string) =>
    set((state) => {
      if (!state.draft || state.draft.type !== "MEDIA") return state;

      return {
        draft: {
          ...state.draft,
          caption,
        },
      };
    }),

  /* =========================
     RESET
  ========================= */

  resetDraft: () => set({ draft: null }),
}));