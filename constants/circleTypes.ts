export type Circle = {
  id: string;
  title: string;
  description: string;
  image: string;
  members: number;
  avatars?: string[];
};

export type AnchorType = "text" | "image" | "video" | "image_text";

export type CirclePost = {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  createdAt: string;
  text?: string;
  image?: string;
  likes: number;
  comments: number;
  likedImage?: number;
  likeCount?: number;
  anchorLikedCount?: number;
  prayedCount?: number;
  savedCount?: number;
  sharedCount?: number;
};

export type BibleAnchor = {
  verseText: string;
  reference: string;
};

export type ActiveAnchor = {
  id: string;
  type: AnchorType;
  title: string;
  content?: string;
  scripture?: string;
  author?: string;
  likedImage?: number;
  anchorLikedCount?: number;
  anchorVerse?: string;
  anchorText?: string;
  bibleReference?: string;
  bibleText?: string;
  backgroundColors?: [string, string];
  backgroundImage?: string;
  anchorImage?: string;
  anchorVideo?: string;
  anchorThumbnail?: string;
  createdAt: string;
  expiresAt?: string;
  mediaUrl?: string;
  prayedCount?: number;
  viewerState?: {
    liked: boolean;
    prayed: boolean;
  };
};

export type Rule = {
  id: number;
  title: string;
  description: string;
};

export type CircleFeedData = {
  bannerImage: string;
  profileImage: string;
  name: string;
  description: string;
  memberCount: number;
  isJoined: boolean;
  activeAnchor?: ActiveAnchor;
  pastAnchors?: ActiveAnchor[];
  posts: CirclePost[];
  memberAvatars?: string[];
  rules?: Rule[];
};
