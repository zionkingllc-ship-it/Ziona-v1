import { graphqlRequest } from "../../graphqlClient";

interface PostAuthor {
  id: string;
  username: string;
  avatarUrl?: string;
}

interface PostStats {
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
}

interface PostViewerState {
  liked: boolean;
  saved: boolean;
  followingAuthor: boolean;
  isOwner: boolean;
}

interface ScriptureVerse {
  number: number;
  text: string;
}

interface PostScripture {
  reference: string;
  text: string;
  translation: string;
  book: string;
  chapter: number;
  verseStart: number;
  verses: ScriptureVerse[];
  verseEnd: number;
}

interface ImageItem {
  id: string;
  url: string;
  type: string;
  width: number;
  height: number;
  thumbnailUrl: string;
  duration?: number;
}

interface PostImage {
  items: ImageItem[];
}

interface PostVideo {
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
}

interface PostCategory {
  id: string;
  label: string;
  slug: string;
  icon: string;
  bgColor: string;
  bdColor: string;
  textPostBg: string;
  order: number;
}

export interface SavedPost {
  id: string;
  type: string;
  author: PostAuthor;
  stats: PostStats;
  viewerState: PostViewerState;
  shareUrl: string;
  createdAt: string;
  scripture?: PostScripture;
  caption?: string;
  textMessage?: string;
  bibleMessage?: string;
  image?: PostImage;
  video?: PostVideo;
  category?: PostCategory;
}

interface SavedPostsResponse {
  posts: SavedPost[];
  nextCursor?: string;
  hasMore: boolean;
}

export async function getSavedPosts(): Promise<SavedPostsResponse | undefined> {
  const query = `
    query GetSavedPosts {
      savedPosts {
        posts {
          id
          type
          author {
            id
            username
            avatarUrl
          }
          stats {
            likesCount
            commentsCount
            sharesCount
            savesCount
          }
          viewerState {
            liked
            saved
            followingAuthor
            isOwner
          }
          shareUrl
          createdAt
          scripture {
            reference
            text
            translation
            book
            chapter
            verseStart
            verses {
              number
              text
            }
            verseEnd
          }
          caption
          textMessage
          bibleMessage
          image {
            items {
              id
              url
              type
              width
              height
              thumbnailUrl
              duration
            }
          }
          video {
            url
            thumbnailUrl
            width
            height
          }
          category {
            id
            label
            slug
            icon
            bgColor
            bdColor
            textPostBg
            order
          }
        }
        nextCursor
        hasMore
      }
    }
  `;

  const data = await graphqlRequest(query, {});
  return data?.savedPosts;
}
