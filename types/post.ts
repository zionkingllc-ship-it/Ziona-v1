import { Category } from "./category";
export type PostType = "image" | "video" | "text";

export interface BasePost {
  id: string;
  type: PostType;
  createdAt: string;

  categories: Category[];

  liked: boolean;
  likesCount: number;

  bookmarked: boolean;
  bookmarks: number;

  author: {
    id: string;
    name: string;
    avatarUrl?: string | number;
  };

  caption?: string;


  report?: {
    reported: boolean;
    reason?: string;
  };
}

/* =========================
   IMAGE
========================= */

export interface ImagePost extends BasePost {
  type: "image";

  media: {
    items: {
      id: string;
      type: "image" | "video";
      url: string | number;
      thumbnailUrl?: string;
    }[];
  };
}

/* =========================
   VIDEO
========================= */

export interface VideoPost extends BasePost {
  type: "video";

  media: {
    videoUrl: string | number;
    thumbnailUrl?: string;
  };
}

/* =========================
   TEXT (MESSAGE + SCRIPTURE)
========================= */

export interface TextPost extends BasePost {
  type: "text";

  /* optional visual (can be empty) */
  media?: {
    backgroundImage?: string | number;
    thumbnailUrl?: string;
  }; 

  /* main content */
  text: {
    message?: string;

    scripture?: {
      book: string;
      chapter: number;
      verseStart: number;
      verseEnd: number;
      translation: string;
      text: string;
    };
  };
}

/* =========================
   UNION
========================= */

export type Post = ImagePost | VideoPost | TextPost;
