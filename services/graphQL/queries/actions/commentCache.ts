import { QueryClient } from "@tanstack/react-query";

type CommentPatchInput = {
  postId: string;
  delta: number;
};

function patchPostCommentCount(post: any, input: CommentPatchInput) {
  if (!post || post.id !== input.postId) {
    return post;
  }

  const current = Number(post?.stats?.commentsCount ?? 0);

  return {
    ...post,
    stats: {
      ...(post.stats ?? {}),
      commentsCount: Math.max(0, current + input.delta),
    },
  };
}

function patchPostsArray(posts: any[], input: CommentPatchInput) {
  let hasChanges = false;

  const nextPosts = posts.map((post) => {
    const nextPost = patchPostCommentCount(post, input);

    if (nextPost !== post) {
      hasChanges = true;
    }

    return nextPost;
  });

  return hasChanges ? nextPosts : posts;
}

function patchAnyData(oldData: any, input: CommentPatchInput) {
  if (!oldData) {
    return oldData;
  }

  if (Array.isArray(oldData)) {
    return patchPostsArray(oldData, input);
  }

  if (Array.isArray(oldData.pages)) {
    let hasChanges = false;

    const pages = oldData.pages.map((page: any) => {
      if (!page || typeof page !== "object") {
        return page;
      }

      const posts = Array.isArray(page.posts) ? page.posts : [];
      const nextPosts = patchPostsArray(posts, input);

      if (nextPosts !== posts) {
        hasChanges = true;
        return { ...page, posts: nextPosts };
      }

      return page;
    });

    return hasChanges ? { ...oldData, pages } : oldData;
  }

  if (Array.isArray(oldData.posts)) {
    const nextPosts = patchPostsArray(oldData.posts, input);
    return nextPosts === oldData.posts ? oldData : { ...oldData, posts: nextPosts };
  }

  return patchPostCommentCount(oldData, input);
}

export function patchCommentCountAcrossQueries(
  queryClient: QueryClient,
  input: CommentPatchInput,
) {
  const filters = [
    { queryKey: ["forYouFeed"] },
    { queryKey: ["followingFeed"] },
    { queryKey: ["discoverFeed"] },
    { queryKey: ["userPosts"] },
    { queryKey: ["likedPosts"] },
    { queryKey: ["savedPosts"] },
    { queryKey: ["userSavedPosts"] },
  ] as const;

  filters.forEach((filter) => {
    queryClient.setQueriesData(filter, (oldData: any) =>
      patchAnyData(oldData, input),
    );
  });

  queryClient.setQueryData(["post", input.postId], (oldData: any) =>
    patchAnyData(oldData, input),
  );
}
