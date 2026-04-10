import { FeedPost } from "@/types/feedTypes";

export type SharePayload = {
  id: string;
  text?: string;
  mediaUrl?: string;
};

export function mapFeedPostToShare(post: FeedPost): SharePayload {
  if (post.type === "media") {
    const first = post.media?.[0];

    return {
      id: post.id,
      text: post.caption,
      mediaUrl: first?.url,
    };
  }

  if (post.type === "text") {
    return {
      id: post.id,
      text: post.message,
    };
  }

  if (post.type === "bible") {
    return {
      id: post.id,
      text: post.scripture?.text,
    };
  }
 
  return {
    id: post.id,
  };
}