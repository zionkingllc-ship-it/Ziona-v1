import { create } from "zustand";
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

const STORAGE_KEY = "app_categories";

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: normalizeCategories(
    DISCOVER_CATEGORIES as DiscoverCategory[]
  ),
  loading: false,

  loadCategories: async () => {
    if (get().loading) return;

    set({ loading: true });

    try {
      /* =========================
         1. LOAD FROM CACHE
      ========================= */

      const cached = await AsyncStorage.getItem(STORAGE_KEY);

      if (cached) {
        const parsed: DiscoverCategory[] = JSON.parse(cached);

        const normalizedCache = normalizeCategories(parsed);

        set({ categories: normalizedCache });
      }

      /* =========================
         2. FETCH FROM BACKEND
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
         3. UPDATE STATE
      ========================= */

      set({ categories: merged });

      /* =========================
         4. SAVE CACHE
      ========================= */

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(merged)
      );
    } catch (err) {
      console.error("Category load failed:", err);
    } finally {
      set({ loading: false });
    }
  },
}));

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