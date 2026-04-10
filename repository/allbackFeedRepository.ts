import { Post } from "@/types/post";
import { MOCK_POSTS } from "@/constants/examplePost";

/* =========================
   FAKE BACKEND SHAPE → MAP TO REAL
========================= */

function normalizePost(post: any): Post {
  if (post.type === "text") {
    return {
      ...post,
      type: "text",

      text: {
        message:
          typeof post.text === "string"
            ? post.text
            : post.text?.message ?? "",

        scripture: post.text?.scripture ??
          (post.scripture
            ? {
                book: post.scripture.book,
                chapter: post.scripture.chapter,
                verseStart: post.scripture.verseStart,
                verseEnd: post.scripture.verseEnd,
                translation: post.scripture.translation,
                text: post.scripture.text,
              }
            : undefined),
      },

      caption:
        post.caption ||
        (typeof post.text === "string"
          ? post.text
          : post.text?.message) ||
        post.scripture?.text ||
        "",
    };
  }

  return post;
}

/* =========================
   PAGINATION (MATCH YOUR CURRENT LOGIC)
========================= */

const PAGE_SIZE = 5;

export async function fetchFallbackFeed({
  pageParam = 0,
}: {
  pageParam?: number;
}): Promise<{ posts: Post[]; nextPage?: number }> {
  await new Promise((r) => setTimeout(r, 500));

  const start = pageParam * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  const slice = MOCK_POSTS.slice(start, end).map(normalizePost);

  return {
    posts: slice,
    nextPage: end < MOCK_POSTS.length ? pageParam + 1 : undefined,
  };
}