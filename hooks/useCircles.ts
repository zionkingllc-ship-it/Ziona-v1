import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCircleFeedData,
  fetchCircleDetail,
  fetchActiveAnchor,
  fetchAnchorByDate,
  fetchAllCircles,
  fetchMyCircles,
  fetchSuggestedCircles,
} from "@/services/graphQL/queries/circles";
import {
  joinCircle as joinCircleMutation,
  leaveCircle as leaveCircleMutation,
  createCirclePost as createCirclePostMutation,
  prayForCirclePost as prayForCirclePostMutation,
  likeCirclePost as likeCirclePostMutation,
  ensureCirclePostLiked as ensureCirclePostLikedMutation,
} from "@/services/graphQL/mutation/circles";

export function useCircleFeedData(
  circleId: string,
  historyLimit = 10,
  page = 1,
  pageSize = 20,
  sortBy?: string,
  authorId?: string,
) {
  return useQuery({
    queryKey: ["circleFeedData", circleId, sortBy, authorId],
    queryFn: () => fetchCircleFeedData(circleId, historyLimit, page, pageSize, sortBy, authorId),
    staleTime: 1000 * 60,
    retry: 2,
  });
}

export function useCircleDetail(circleId: string) {
  return useQuery({
    queryKey: ["circleDetail", circleId],
    queryFn: () => fetchCircleDetail(circleId),
    staleTime: 1000 * 60,
  });
}

export function useActiveAnchor(circleId: string) {
  return useQuery({
    queryKey: ["activeAnchor", circleId],
    queryFn: () => fetchActiveAnchor(circleId),
    staleTime: 1000 * 60,
    refetchInterval: 30000,
    enabled: !!circleId,
    retry: 2,
  });
}

export function useAnchorByDate(circleId: string, date: string) {
  return useQuery({
    queryKey: ["anchorByDate", circleId, date],
    queryFn: () => fetchAnchorByDate(circleId, date),
    staleTime: 1000 * 60,
    enabled: !!date,
    retry: 2,
  });
}

export function useAllCircles() {
  return useQuery({
    queryKey: ["allCircles"],
    queryFn: fetchAllCircles,
    staleTime: 1000 * 60 * 5,
  });
}

export function useMyCircles() {
  return useQuery({
    queryKey: ["myCircles"],
    queryFn: fetchMyCircles,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSuggestedCircles() {
  return useQuery({
    queryKey: ["suggestedCircles"],
    queryFn: fetchSuggestedCircles,
    staleTime: 1000 * 60 * 5,
  });
}

export function useJoinCircle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (circleId: string) => joinCircleMutation(circleId),
    onSuccess: (_, circleId) => {
      queryClient.invalidateQueries({ queryKey: ["circleFeedData", circleId] });
      queryClient.invalidateQueries({ queryKey: ["circleDetail", circleId] });
      queryClient.invalidateQueries({ queryKey: ["myCircles"] });
      queryClient.invalidateQueries({ queryKey: ["allCircles"] });
    },
  });
}

export function useLeaveCircle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (circleId: string) => leaveCircleMutation(circleId),
    onSuccess: (_, circleId) => {
      queryClient.invalidateQueries({ queryKey: ["circleFeedData", circleId] });
      queryClient.invalidateQueries({ queryKey: ["circleDetail", circleId] });
      queryClient.invalidateQueries({ queryKey: ["myCircles"] });
      queryClient.invalidateQueries({ queryKey: ["allCircles"] });
    },
  });
}

export function useCreateCirclePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      circleId,
      text,
      mediaIds,
      mediaType,
    }: {
      circleId: string;
      text: string;
      mediaIds: string[];
      mediaType: string;
    }) => createCirclePostMutation(circleId, text, mediaIds, mediaType),
    onSuccess: (_, { circleId }) => {
      queryClient.invalidateQueries({ queryKey: ["circleFeedData", circleId] });
    },
  });
}

export function usePrayForCirclePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => prayForCirclePostMutation(postId),
  });
}

export function useLikeCirclePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => likeCirclePostMutation(postId),
  });
}

export function useEnsureCirclePostLiked() {
  return useMutation({
    mutationFn: (postId: string) => ensureCirclePostLikedMutation(postId),
  });
}
