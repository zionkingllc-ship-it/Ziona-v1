import { FeedTextPost, FeedBiblePost } from "@/types/feedTypes";

type TextCardOutput = {
  category?: {
    label?: string;
    bgColor?: string;
    bdColor?: string;
  };

  scripture?: string;
  translation?: string;
  verseText?: string;
  testimonyText?: string;
};

export function mapFeedToTextCard(
  post: FeedTextPost | FeedBiblePost
): TextCardOutput {
  /* ================= BIBLE ================= */
  if (post.type === "bible" && post.scripture) {
    return {
      category: post.category,

      scripture: `${post.scripture.book} ${post.scripture.chapter}:${post.scripture.verseStart}${
        post.scripture.verseEnd
          ? `-${post.scripture.verseEnd}`
          : ""
      }`,

      translation: post.scripture.translation,

      verseText: post.scripture.verses?.map(v => v.text).join(" ") ?? undefined,

      testimonyText: post.caption || undefined,
    };
  }

  /* ================= TEXT ================= */
  return {
    category: post.category,
    testimonyText: post.caption || undefined,
  };
}