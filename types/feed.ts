export type FeedStatus = "idle" | "loading" | "success" | "empty" | "error";
import { Post } from "./post";

export interface FeedState {
  data: Post[];
  status: FeedStatus;
  error?: string;
  nextPage?: number;
  hasMore?: boolean;
}

export interface FeedStore {
  forYou: FeedState;
  following: FeedState;
  setForYou: (data: Partial<FeedState>) => void;
  setFollowing: (data: Partial<FeedState>) => void;
  resetFeed: () => void;
}
