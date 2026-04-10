import { DiscoverCategory } from "@/types/discover";

/* =========================
   ICON NORMALIZER
========================= */

export function normalizeIcon(icon: any) {
  if (!icon) return undefined;

  // backend format: { uri: "..." }
  if (typeof icon === "object" && typeof icon.uri === "string") {
    return { uri: icon.uri };
  }

  // fallback: string
  if (typeof icon === "string") {
    return { uri: icon };
  }

  return undefined;
}

/* =========================
   CATEGORY NORMALIZER
========================= */

export function normalizeCategory(
  category: DiscoverCategory
): DiscoverCategory {
  return {
    ...category,
    icon: normalizeIcon(category.icon),
  };
}

/* =========================
   BULK NORMALIZER
========================= */

export function normalizeCategories(
  categories: DiscoverCategory[]
): DiscoverCategory[] {
  return categories.map(normalizeCategory);
}