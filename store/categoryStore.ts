import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getCategories } from "@/repository/categoryRepository";
import { DISCOVER_CATEGORIES } from "@/constants/discoverCategories";
import { DiscoverCategory } from "@/types/discover";

import {
  normalizeCategories,
} from "@/utils/categoryNormalizer";

interface CategoryState {
  categories: DiscoverCategory[];
  loading: boolean;

  loadCategories: () => Promise<void>;
}

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      categories: normalizeCategories(
        DISCOVER_CATEGORIES as DiscoverCategory[]
      ),
      loading: false,

      loadCategories: async () => {
        if (get().loading) return;

        set({ loading: true });

        try {
          /* =========================
             1. FETCH FROM BACKEND
          ========================= */

          const backend = await getCategories();

          const normalizedBackend = normalizeCategories(backend);

          const normalizedLocal = normalizeCategories(
            DISCOVER_CATEGORIES as DiscoverCategory[]
          );

          const merged = mergeCategories(
            normalizedLocal,
            normalizedBackend
          );

          /* =========================
             2. UPDATE STATE
          ========================= */

          set({ categories: merged });
        } catch (err) {
          console.error("Category load failed:", err);
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "app_categories",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ categories: state.categories }),
    },
  ),
);

/* =========================
   MERGE (BACKEND WINS)
========================= */

function mergeCategories(
  local: DiscoverCategory[],
  backend: DiscoverCategory[]
): DiscoverCategory[] {
  const map = new Map<string, DiscoverCategory>();

  local.forEach((c) => map.set(c.slug, c));

  backend.forEach((b) => {
    map.set(b.slug, b);
  });

  return Array.from(map.values()).sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
}
