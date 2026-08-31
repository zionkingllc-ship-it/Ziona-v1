import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { reportContent, ReportReason } from "@/services/graphQL/mutation/actions/report";

type FeedPage = { posts: any[]; nextCursor?: string; hasMore: boolean };

function removePostFromPages(
  pages: InfiniteData<FeedPage> | undefined,
  postId: string,
): InfiniteData<FeedPage> | undefined {
  if (!pages) return pages;

  let found = false;
  const updated = {
    ...pages,
    pages: pages.pages.map((page) => {
      const idx = page.posts.findIndex((p: any) => p.id === postId);
      if (idx === -1) return page;
      found = true;
      return {
        ...page,
        posts: [...page.posts.slice(0, idx), ...page.posts.slice(idx + 1)],
      };
    }),
  };

  return found ? updated : pages;
}

export function useReportContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reason,
      postId,
      commentId,
      description,
    }: {
      reason: ReportReason;
      postId?: string;
      commentId?: string;
      description?: string;
    }) => reportContent(reason, postId, commentId, description),

    onMutate: async ({ postId }) => {
      if (!postId) return {};

      const feedKeys = [["forYouFeed"], ["followingFeed"]] as const;

      const previous: Record<string, InfiniteData<FeedPage> | undefined> = {};

      for (const key of feedKeys) {
        const queryKey = key as unknown as string[];
        previous[queryKey[0]] = queryClient.getQueryData(queryKey);
        queryClient.setQueryData(queryKey, (old: InfiniteData<FeedPage> | undefined) =>
          removePostFromPages(old, postId),
        );
      }

      return { previous, postId };
    },

    onError: (_err, _vars, context) => {
      if (!context?.previous) return;

      for (const [key, data] of Object.entries(context.previous)) {
        queryClient.setQueryData([key], data);
      }
    },
  });
}
