import { QueryClient } from "@tanstack/react-query";

export async function invalidateFeed(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["feed", "forYou"] }),
    queryClient.invalidateQueries({ queryKey: ["feed", "following"] }),
  ]);

  console.log("Feed invalidated (forYou + following)");
}