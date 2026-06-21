import { graphqlRequest } from "@/services/graphQL/graphqlClient";
import { FeedPost } from "@/types/feedTypes";
import { normalizePost } from "@/utils/feed/normalizePost";
import { useQuery } from "@tanstack/react-query";

const GET_POST = `
query GetPost($id: ID!) {
  post(id: $id) {
    id
    type
    caption
    createdAt
    shareUrl
    category { slug textPostBg bgColor id label }
    textMessage
    bibleMessage
    scripture { verses { text number } verseEnd verseStart translation book chapter reference }
    author { id username avatarUrl }
    media { id url thumbnailUrl type duration height width }
    mediaType
    mediaUrl
    stats { likesCount commentsCount savesCount sharesCount }
    viewerState { liked saved followingAuthor followedByAuthor isOwner }
  }
}
`;

export function usePostById(postId?: string) {
  return useQuery<FeedPost | null>({
    queryKey: ["post", postId],
    queryFn: async () => {
      if (!postId) return null;
      const data = await graphqlRequest(GET_POST, { id: postId });
      return normalizePost(data?.post);
    },
    enabled: !!postId,
    staleTime: 5 * 60 * 1000,
  });
}
