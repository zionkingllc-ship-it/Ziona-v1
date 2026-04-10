 import React, { createContext, useContext, useState, ReactNode } from "react";
import { Post } from "@/types/post";
import { FeedPost } from "@/types/feedTypes";

type FeedKey = string; // e.g., "discover:love"

interface FeedStoreType {
  feeds: Record<FeedKey,FeedPost []>;
  setFeed: (key: FeedKey, posts: FeedPost []) => void;
  getFeed: (key: FeedKey) => FeedPost [] | undefined;
}

const FeedContext = createContext<FeedStoreType | undefined>(undefined);

export const FeedProvider = ({ children }: { children: ReactNode }) => {
  const [feeds, setFeeds] = useState<Record<FeedKey, FeedPost []>>({});

  const setFeed = (key: FeedKey, posts: FeedPost []) => {
    setFeeds((prev) => ({ ...prev, [key]: posts }));
  };

  const getFeed = (key: FeedKey) => feeds[key];

  return (
    <FeedContext.Provider value={{ feeds, setFeed, getFeed }}>
      {children}
    </FeedContext.Provider>
  );
};

export const useFeedStore = () => {
  const ctx = useContext(FeedContext);
  if (!ctx) throw new Error("useFeedStore must be used inside FeedProvider");
  return ctx;
};