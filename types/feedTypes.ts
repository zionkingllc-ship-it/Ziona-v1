export type FeedPost = FeedTextPost | FeedMediaPost | FeedBiblePost;

/* =========================
   SHARED
 ========================= */

type BaseFeedPost = {
  id: string;
  createdAt: string;
  shareUrl?: string;

  caption?: string;

  category?: {
    slug: string;
    textPostBg: string;
    bgColor: string;
    id: string;
    label: string;
  };

  author?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };

  stats: {
    likesCount: number;
    commentsCount: number;
    savesCount: number;
    sharesCount: number;
  };

  viewerState: {
    liked: boolean;
    saved: boolean;
    followingAuthor: boolean;
    followedByAuthor: boolean;
    isOwner: boolean;
  };
};

/* =========================
   SCRIPTURE SHARED TYPE
 ========================= */

type Scripture = {
  text?: string;
  verses?: { text: string; number: number }[]
  verseEnd?: number;
  verseStart?: number;
  translation?: string;
  book?: string;
  chapter?: number;
  reference?: string;
};

/* =========================
   TEXT
 ========================= */

export type FeedTextPost = BaseFeedPost & {
  type: "text";
  textMessage?: string;
  bibleMessage?: string;
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
  textMessage?: string;
  scripture: Scripture;
};
