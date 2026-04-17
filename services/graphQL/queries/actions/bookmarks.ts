import { graphqlRequest } from "../../graphqlClient";

interface PostAuthor {
  id: string;
  username: string;
  avatarUrl?: string;
}

interface PostStats {
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  sharesCount: number;
}

interface PostViewerState {
  liked: boolean;
  saved: boolean;
  followingAuthor: boolean;
  followedByAuthor: boolean;
  isOwner: boolean;
}

interface PostCategory {
  slug: string;
  textPostBg: string;
  bgColor: string;
  id: string;
  label: string;
}

interface PostScripture {
  verses?: { text: string; number: number }[]
  verseEnd?: number;
  verseStart?: number;
  translation?: string;
  book?: string;
  chapter?: number;
  reference?: string;
}

interface ImageItem {
  id: string;
  url: string;
  type: string;
  thumbnailUrl: string;
}

interface PostImage {
  items: ImageItem[];
}

interface PostVideo {
  url: string;
  thumbnailUrl: string;
}

export interface SavedPost {
  id: string;
  type: string;
  author: PostAuthor;
  stats: PostStats;
  viewerState: PostViewerState;
  shareUrl: string;
  createdAt: string;
  category?: PostCategory;
  scripture?: PostScripture;
  caption?: string;
  textMessage?: string;
  bibleMessage?: string;
  image?: PostImage;
  video?: PostVideo;
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
            savesCount
            sharesCount
          }
          viewerState {
            liked
            saved
            followingAuthor
            followedByAuthor
            isOwner
          }
          shareUrl
          createdAt
          category { slug textPostBg bgColor id label }
          scripture {
            verses { text number }
            verseEnd
            verseStart
            translation
            book
            chapter
            reference
          }
          caption
          textMessage
          bibleMessage
          image {
            items {
              id
              url
              type
              thumbnailUrl
            }
          }
          video {
            url
            thumbnailUrl
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
