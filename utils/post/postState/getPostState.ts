import { FeedPost } from "@/types/feedTypes";
import { usePostActionsStore } from "@/store/usePostActionStore";

export function getPostState(post: FeedPost) {
  const likedOverride =
    usePostActionsStore.getState().likedPosts[post.id];

  const savedOverride =
    usePostActionsStore.getState().savedPosts[post.id];

  return {
    liked: likedOverride ?? post.viewerState?.liked ?? false,
    saved: savedOverride ?? post.viewerState?.saved ?? false,
  };
}