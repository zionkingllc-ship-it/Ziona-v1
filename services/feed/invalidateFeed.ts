import { QueryClient } from "@tanstack/react-query";

export async function invalidateFeed(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["forYouFeed"] }),
    queryClient.invalidateQueries({ queryKey: ["followingFeed"] }),
  ]);

  console.log("Feed invalidated (forYou + following)");
}
