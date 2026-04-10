import { FeedPost } from "@/types/feedTypes";
import { usePostActionsStore } from "@/store/usePostActionStore";

export function getPostLikeData(post: FeedPost) {
  const store = usePostActionsStore.getState();

  const override = store.likedPosts[post.id];
  const baseLiked = post.viewerState?.liked ?? false;

  const liked = override ?? baseLiked;

  const baseCount = post.stats?.likesCount ?? 0;

  let count = baseCount;

  if (override !== undefined) {
    if (override && !baseLiked) count += 1;
    if (!override && baseLiked) count -= 1;
  }

  return {
    liked,
    likeCount: count,
  };
}