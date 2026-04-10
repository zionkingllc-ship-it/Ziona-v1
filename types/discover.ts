import { Category } from "./category";

export type DiscoverPost = {
  id: string;
  type: "image" | "video" | "text";
  media?: {
    url: string | number;
    thumbnailUrl?: string;
    type?: "image" | "video";
  }[];
  text?: string;
};

export type DiscoverCategory = Category; 