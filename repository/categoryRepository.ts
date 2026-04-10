import { graphqlRequest } from "@/services/graphQL/graphqlClient";
import { DiscoverCategory } from "@/types/discover";

const GET_DISCOVER_CATEGORIES = `
query DiscoverCategories {
  discoverCategories {
    id
    label
    slug
    bgColor
    bdColor
    icon
    order
  }
}
`;

function normalizeIcon(icon: any) {
  if (!icon) return undefined;

  if (typeof icon === "string") {
    return { uri: icon };
  }

  if (typeof icon === "object" && icon.uri) {
    return { uri: icon.uri };
  }

  return undefined;
}

export async function getCategories(): Promise<DiscoverCategory[]> {
  console.log("━━━━━━━━ CATEGORY FETCH ━━━━━━━━");

  const data = await graphqlRequest(GET_DISCOVER_CATEGORIES);

  const categories = data?.discoverCategories ?? [];

  const mapped: DiscoverCategory[] = categories.map(
    (cat: any, index: number) => ({
      id: cat.id,
      label: cat.label,
      slug: cat.slug,

     icon: normalizeIcon(cat.icon),

      bgColor: cat.bgColor ?? "#F4F3F4",
      bdColor: cat.bdColor ?? "#E5E5E5",

      order: cat.order ?? index,
    })
  );

  console.log("Mapped categories for UI:", mapped);

  return mapped;
}