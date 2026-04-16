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
  textMessage: string;
  scripture?: Scripture;
};

/* =========================
   MEDIA
========================= */

type ImageMedia = {
  type: "image";
  url: string;
  thumbnailUrl?: string;
};

type VideoMedia = {
  type: "video";
  url: string;
  thumbnailUrl?: string;
};

export type FeedMediaPost =
  | (BaseFeedPost & {
      type: "media";
      mediaType: "image";
      media: ImageMedia[];
    })
  | (BaseFeedPost & {
      type: "media";
      mediaType: "video";
      media: [VideoMedia]; 
    });

/* =========================
   BIBLE
========================= */

export type FeedBiblePost = BaseFeedPost & {
  type: "bible";
  scripture: Scripture;
};
