import { FeedPost, FeedMediaPost, FeedTextPost, FeedBiblePost } from "@/types/feedTypes";

export type SharePayload = {
  id: string;
  text?: string;
  mediaUrl?: string;
};

export function mapFeedPostToShare(post: FeedPost): SharePayload {
  const base = { id: post.id };

  if (post.type === "media") {
    const mediaPost = post as FeedMediaPost;
    const first = mediaPost.media?.[0];
    return {
      ...base,
      text: mediaPost.caption,
      mediaUrl: first?.url,
    };
  }

  if (post.type === "text") {
    const textPost = post as FeedTextPost;
    return {
      ...base,
      text: textPost.textMessage ?? textPost.bibleMessage,
    };
  }

  if (post.type === "bible") {
    const biblePost = post as FeedBiblePost;
    const verses = biblePost.scripture?.verses;
    const text = verses?.map(v => v.text).join(" ") ?? biblePost.scripture?.reference;
    return {
      ...base,
      text,
    };
  }

  return base;
}
