export type FeedPost = FeedTextPost | FeedMediaPost | FeedBiblePost;

/* =========================
   SHARED
========================= */

type BaseFeedPost = {
  id: string;
  createdAt: string;

  caption?: string;

  author?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };

  category?: {
    id: string;
    label: string;
    slug: string;
    bgColor?: string;
    bdColor?: string;
    textPostBg: string;
  };
 
  stats: {
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    savesCount: number;
  };
 
  viewerState: {
    liked: boolean;
    saved: boolean;
    followingAuthor: boolean;
    isOwner: boolean;
  };
};

/* =========================
   SCRIPTURE SHARED TYPE
========================= */

type Scripture = {
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  translation: string;
  text: string;
};

/* =========================
   TEXT
========================= */

export type FeedTextPost = BaseFeedPost & {
  type: "text";
  message: string;
  scripture?: Scripture;
};

/* =========================
   MEDIA
========================= */

export type FeedMediaPost = BaseFeedPost & {
  type: "media";
  mediaType: "image" | "video";
  media: {
    type: "image" | "video";
    url: string;
    thumbnailUrl?: string;
  }[];
};

/* =========================
   BIBLE
========================= */

export type FeedBiblePost = BaseFeedPost & {
  type: "bible";
  scripture: Scripture;
};