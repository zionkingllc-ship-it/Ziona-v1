import type { QueryClient } from "@tanstack/react-query";

/** Reset the active infinite query, then refetch only its cursor-less first page. */
export async function refreshFeedQuery(
  queryClient: QueryClient,
  feedType: "forYou" | "following",
) {
  const key = feedType === "forYou" ? "forYouFeed" : "followingFeed";
  await queryClient.cancelQueries({ queryKey: [key], exact: true });
  await queryClient.resetQueries({ queryKey: [key], exact: true });
}
