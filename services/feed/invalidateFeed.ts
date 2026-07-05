import { QueryClient } from "@tanstack/react-query";

export async function invalidateFeed(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["forYouFeed"] }),
    queryClient.invalidateQueries({ queryKey: ["followingFeed"] }),
    queryClient.invalidateQueries({ queryKey: ["userPosts"] }),
  ]);

  console.log("Feed invalidated (forYou + following + userPosts)");
}

export function movePostToFeedTop(
  queryClient: QueryClient,
  postId: string,
) {
  const feedKeys = [["forYouFeed"], ["followingFeed"]];
  feedKeys.forEach((key) => {
    queryClient.setQueryData(key, (oldData: any) => {
      if (!oldData?.pages?.length) return oldData;
      const pages = [...oldData.pages];
      const firstPage = { ...pages[0] };
      const posts = [...(firstPage.posts ?? [])];

      const postIndex = posts.findIndex((p: any) => p?.id === postId);
      if (postIndex <= 0) return oldData;

      const [post] = posts.splice(postIndex, 1);
      pages[0] = { ...firstPage, posts: [post, ...posts] };
      return { ...oldData, pages };
    });
  });
}
