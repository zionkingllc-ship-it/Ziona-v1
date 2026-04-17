import { QueryClient } from "@tanstack/react-query";

type LikePatchInput = {
  postId: string;
  liked: boolean;
  likesCount?: number;
};

type PatchOptions = {
  removePost?: boolean;
};

function getNextLikesCount(post: any, input: LikePatchInput) {
  if (typeof input.likesCount === "number") {
    return input.likesCount;
  }

  const baseLiked = post?.viewerState?.liked ?? false;
  const currentCount = Number(post?.stats?.likesCount ?? 0);

  if (input.liked === baseLiked) {
    return currentCount;
  }

  if (input.liked) {
    return currentCount + 1;
  }

  return Math.max(0, currentCount - 1);
}

function patchPostLikeState(post: any, input: LikePatchInput) {
  if (!post || post.id !== input.postId) {
    return post;
  }

  return {
    ...post,
    stats: {
      ...(post.stats ?? {}),
      likesCount: getNextLikesCount(post, input),
      commentsCount: Number(post?.stats?.commentsCount ?? 0),
      savesCount: Number(post?.stats?.savesCount ?? 0),
      sharesCount: Number(post?.stats?.sharesCount ?? 0),
    },
    viewerState: {
      ...(post.viewerState ?? {}),
      liked: input.liked,
      saved: Boolean(post?.viewerState?.saved ?? false),
      followingAuthor: Boolean(post?.viewerState?.followingAuthor ?? false),
      followedByAuthor: Boolean(post?.viewerState?.followedByAuthor ?? false),
      isOwner: Boolean(post?.viewerState?.isOwner ?? false),
    },
  };
}

function patchInfinitePostsData(
  oldData: any,
  input: LikePatchInput,
  options?: PatchOptions,
) {
  if (!oldData || !Array.isArray(oldData.pages)) {
    return oldData;
  }

  let hasChanges = false;

  const pages = oldData.pages.map((page: any) => {
    const posts = Array.isArray(page?.posts) ? page.posts : [];

    if (options?.removePost) {
      const filteredPosts = posts.filter((post: any) => post?.id !== input.postId);

      if (filteredPosts.length !== posts.length) {
        hasChanges = true;
        return {
          ...page,
          posts: filteredPosts,
        };
      }

      return page;
    }

    const nextPosts = posts.map((post: any) => {
      const nextPost = patchPostLikeState(post, input);

      if (nextPost !== post) {
        hasChanges = true;
      }

      return nextPost;
    });

    if (nextPosts === posts) {
      return page;
    }

    return {
      ...page,
      posts: nextPosts,
    };
  });

  if (!hasChanges) {
    return oldData;
  }

  return {
    ...oldData,
    pages,
  };
}

export function patchLikeAcrossQueries(
  queryClient: QueryClient,
  input: LikePatchInput,
) {
  const filters = [
    { queryKey: ["forYouFeed"] },
    { queryKey: ["followingFeed"] },
    { queryKey: ["discoverFeed"] },
    { queryKey: ["userPosts"] },
    { queryKey: ["likedPosts"] },
  ] as const;

  filters.forEach((filter) => {
    queryClient.setQueriesData(filter, (oldData: any) =>
      patchInfinitePostsData(oldData, input),
    );
  });
}

export function removePostFromLikedQueries(
  queryClient: QueryClient,
  postId: string,
) {
  queryClient.setQueriesData({ queryKey: ["likedPosts"] }, (oldData: any) =>
    patchInfinitePostsData(
      oldData,
      {
        postId,
        liked: false,
      },
      { removePost: true },
    ),
  );
}

export async function invalidateLikeQueries(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["forYouFeed"] }),
    queryClient.invalidateQueries({ queryKey: ["followingFeed"] }),
    queryClient.invalidateQueries({ queryKey: ["discoverFeed"] }),
    queryClient.invalidateQueries({ queryKey: ["userPosts"] }),
    queryClient.invalidateQueries({ queryKey: ["likedPosts"] }),
  ]);
}
