import { useState } from "react";
import { likeCirclePost } from "@/services/graphQL/mutation/circles";

export function useCirclePostLike(
  postId: string,
  initialLiked: boolean,
  initialLikeCount: number,
) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [togglingLike, setTogglingLike] = useState(false);

  const handleToggleLike = async () => {
    if (togglingLike) return;
    setTogglingLike(true);

    const newLiked = !isLiked;
    const newCount = newLiked ? likeCount + 1 : likeCount - 1;
    setIsLiked(newLiked);
    setLikeCount(newCount);

    try {
      const result = await likeCirclePost(postId);
      if (result?.success) {
        setIsLiked(result.liked ?? newLiked);
        setLikeCount(result.likesCount ?? newCount);
      }
    } catch {
      setIsLiked(!newLiked);
      setLikeCount(likeCount);
    } finally {
      setTogglingLike(false);
    }
  };

  return { isLiked, likeCount, handleToggleLike, togglingLike };
}
