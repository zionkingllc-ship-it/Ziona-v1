import { FeedPost } from "@/types/feedTypes";

type MergeOverrides = {
  likedPosts?: Record<string, boolean>;
  savedPosts?: Record<string, boolean>;
  followedUsers?: Record<string, boolean>;
};

export function mergePostState(
  post: FeedPost,
  overrides?: MergeOverrides
): FeedPost {
  const likedMap = overrides?.likedPosts ?? {};
  const savedMap = overrides?.savedPosts ?? {};
  const followMap = overrides?.followedUsers ?? {};

  const baseLiked = post.viewerState?.liked ?? false;
  const baseSaved = post.viewerState?.saved ?? false;
  const baseFollowing = post.viewerState?.followingAuthor ?? false;
  const baseOwner = post.viewerState?.isOwner ?? false;

  // 🔥 LOCK override ONCE
  const hasLikedOverride = likedMap[post.id] !== undefined;
  const hasSavedOverride = savedMap[post.id] !== undefined;

  const liked = hasLikedOverride
    ? likedMap[post.id]
    : baseLiked;

  const saved = hasSavedOverride
    ? savedMap[post.id]
    : baseSaved;

  const isFollowing =
    post.author?.id && followMap[post.author.id] !== undefined
      ? followMap[post.author.id]
      : baseFollowing;

  const baseLikesCount = post.stats?.likesCount ?? 0;
  const baseComments = post.stats?.commentsCount ?? 0;
  const baseShares = post.stats?.sharesCount ?? 0;
  const baseSaves = post.stats?.savesCount ?? 0;

  let likesCount = baseLikesCount;
 
  if (hasLikedOverride) {
    if (liked && !baseLiked) likesCount += 1;
    if (!liked && baseLiked) likesCount -= 1;
  }

  return {
    ...post,

    viewerState: {
      liked,
      saved,
      followingAuthor: isFollowing,
      isOwner: baseOwner,
    },

    stats: {
      likesCount,
      commentsCount: baseComments,
      sharesCount: baseShares,
      savesCount: baseSaves,
    },
  };
}