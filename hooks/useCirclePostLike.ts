import { useCallback } from "react";
import { likeCirclePost } from "@/services/graphQL/mutation/circles";
import { useCirclePostLikeStore } from "@/store/useCirclePostLikeStore";

export function useCirclePostLike(
  postId: string,
  initialLiked: boolean,
  initialLikeCount: number,
) {
  const storeKey = `circle:${postId}`;
  const stored = useCirclePostLikeStore((s) => s.likes[storeKey]);
  const setLike = useCirclePostLikeStore((s) => s.setLike);
  const optimisticToggle = useCirclePostLikeStore((s) => s.optimisticToggle);

  const isLiked = stored?.isLiked ?? initialLiked;
  const likeCount = stored?.likeCount ?? initialLikeCount;

  const handleToggleLike = useCallback(async () => {
    const current = { isLiked, likeCount };
    optimisticToggle(storeKey, current);

    try {
      const result = await likeCirclePost(postId);
      setLike(storeKey, {
        isLiked: result?.liked ?? !current.isLiked,
        likeCount: result?.likesCount ?? current.likeCount,
      });
    } catch {
      setLike(storeKey, current);
    }
  }, [postId, storeKey, isLiked, likeCount, optimisticToggle, setLike]);

  return { isLiked, likeCount, handleToggleLike, togglingLike: false };
}
