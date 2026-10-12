import { QueryClient } from "@tanstack/react-query";

import { publishMediaPost } from "@/services/graphQL/drafts/mediaDraft";
import { publishDraftPost } from "@/services/graphQL/publishDraftPost";
import { invalidateFeed, movePostToFeedTop } from "@/services/feed/invalidateFeed";
import { useCreatePostStore } from "@/store/createPostStore";
import { useUploadStore } from "@/store/uploadStore";
import { notifyUploadComplete } from "@/utils/uploadEvents";
import { getNetworkModalCopy } from "@/utils/network/getNetworkModalCopy";
import { normalizePost } from "@/utils/feed/normalizePost";

export async function runPostUpload(queryClient: QueryClient) {
  const store = useUploadStore.getState();

  if (store.status === "uploading" || store.status === "publishing") return;
  const uploadId = store.startUpload();
  const isCurrent = () => useUploadStore.getState().uploadId === uploadId;
  const assertActive = () => {
    if (!isCurrent() || useUploadStore.getState().cancelRequested) {
      throw new Error("Upload cancelled");
    }
  };
  const beforePublish = () => {
    assertActive();
    // Once the create request starts, the server may commit it even if we disconnect.
    useUploadStore.getState().setStatus("publishing");
  };

  const draft = useCreatePostStore.getState().draft;

  if (!draft) {
    store.setStatus("failed");
    store.setError({
      title: "Upload failed",
      message: "No post content selected.",
    });
    return;
  }

  let progressTimer: ReturnType<typeof setInterval> | null = null;

  const onProgress = (percent: number) => {
    if (!isCurrent() || useUploadStore.getState().cancelRequested) return;
    useUploadStore.getState().setProgress(percent);
  };

  // Non-media posts publish without a progress callback, so simulate one.
  if (draft.type !== "MEDIA") {
    progressTimer = setInterval(() => {
      if (!isCurrent()) return;
      const current = useUploadStore.getState().progress;
      if (current < 90) useUploadStore.getState().setProgress(current + 5);
    }, 300);
  }

  const stopProgress = () => {
    if (progressTimer) clearInterval(progressTimer);
  };

  try {
    if (draft.type !== "MEDIA") beforePublish();
    const result =
      draft.type === "MEDIA"
        ? await publishMediaPost(draft, queryClient, onProgress, undefined, { assertActive, beforePublish })
        : await publishDraftPost(draft, queryClient);

    stopProgress();

    if (!isCurrent()) return;

    if (useUploadStore.getState().cancelRequested) {
      useUploadStore.getState().setStatus("cancelled");
      return;
    }

    const refreshFeed = async () => {
      try {
        await invalidateFeed(queryClient);

        if (result?.post?.id) {
          await queryClient.refetchQueries({ queryKey: ["forYouFeed"], exact: true });
          movePostToFeedTop(queryClient, result.post.id, result.post);
        }
        await queryClient.refetchQueries({ queryKey: ["userPosts"] });
      } catch (err) {
        console.warn("[postUpload] background feed refresh failed:", err);
      }
    };

    useUploadStore.getState().setProgress(100);

    if (result?.post?.id) {
      useUploadStore.getState().setPostId(result.post.id);

      const normalized = normalizePost(result.post);
      if (normalized) {
        queryClient.setQueryData(["post", result.post.id], normalized);
      }

      movePostToFeedTop(queryClient, result.post.id, result.post);
    }

    await refreshFeed();

    useUploadStore.getState().setStatus("completed");

    if (useUploadStore.getState().exited) {
      useCreatePostStore.getState().resetDraft();
      notifyUploadComplete();
    }
  } catch (error: any) {
    stopProgress();

    if (!isCurrent()) return;

    if (useUploadStore.getState().cancelRequested) {
      useUploadStore.getState().setStatus("cancelled");
      return;
    }

    const feedback = getNetworkModalCopy(
      error,
      error?.message || "Upload failed",
    );

    if (useUploadStore.getState().exited) {
      notifyUploadComplete("Upload failed", feedback.message);
    }

    useUploadStore.getState().setError({
      title: feedback.title,
      message: feedback.message,
    });
    useUploadStore.getState().setStatus("failed");
  }
}
