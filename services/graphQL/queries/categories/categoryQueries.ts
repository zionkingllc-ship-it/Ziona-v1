export const GET_DISCOVER_CATEGORIES = `
query DiscoverCategories {
  discoverCategories {
    id 
    slug
    icon
    bdColor
    bgColor
    textPostBg
    order
  }
}
`;