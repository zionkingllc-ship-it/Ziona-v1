export type FeedPost = FeedTextPost | FeedMediaPost | FeedBiblePost;

export type FeedCirclePromo = {
  type: "circlePromo";
  id: string;
  circles: {
    id: string;
    name: string;
    description: string;
    coverImage: string;
    memberCount: number;
    isJoined: boolean;
    avatars?: string[];
    members?: { id: string; name: string; avatarUrl?: string }[];
  }[];
};

export type FeedItem = FeedPost | FeedCirclePromo;

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
  sortOrder?: number;
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
