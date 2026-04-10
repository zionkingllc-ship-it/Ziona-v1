export const GET_DISCOVER_CATEGORIES = `
query DiscoverCategories {
  discoverCategories {
    id
    name
    slug
    icon
    bdColor
    bgColor
    textPostBg
    order
  }
}
`;