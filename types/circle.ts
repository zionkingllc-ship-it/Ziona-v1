// types/circle.ts
import { FeedPost } from "@/types/feedTypes"

export type FaithCircle = {
  id: string
  name: string
  description: string
  coverImage: string
  membersCount: number
  isJoined: boolean
  joined?: boolean // deprecated, use isJoined
  isAdminManaged: boolean
  createdAt: string
}

export type CirclePost = FeedPost & {
  circleId: string
  circleName?: string
  isAnchor?: boolean
}
export type CircleUser = {
  id: string;
  name: string;
  avatar: string;
};

export type CircleContent =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "image";
      imageUrl: string;
    }
  | {
      type: "video";
      videoUrl: string;
      thumbnail?: string;
    };

  export type AnchorPreview = {
  type: CircleContent["type"];
  previewText?: string;
  previewImage?: string;
};

export type AnchorPost = {
  id: string;
  user: CircleUser;
  createdAt: string;

  text?: string;
  image?: string;

  anchor?: {
    content: CircleContent;
    preview: AnchorPreview;
  };

  stats: {
    likes: number;
    comments: number;
  };
}