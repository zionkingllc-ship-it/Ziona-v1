import {
  requestUploadSession,
  uploadWithStrategy,
  confirmMediaUpload,
  waitForMediaProcessing,
} from "../mutation/media/mediaUpload";
import { createMediaPost } from "../mutation/createPost";

import { MediaDraft } from "@/types/createPost";
import { invalidateFeed } from "@/services/feed/invalidateFeed";

import { QueryClient } from "@tanstack/react-query";

import { prepareUploadMedia } from "@/services/utils/prepareUploadMedia";

/* =========================
   MAIN FUNCTION
========================= */

export async function preUploadMedia(
  items: { uri: string; type: string }[],
  onProgress?: (percent: number) => void,
): Promise<{ mediaIds: string[]; mediaUrls: string[] }> {
  const itemWeight = 100 / items.length;
  let completedItems = 0;

  const uploads = items.map(async (item, index: number) => {
    try {
      const { uri: fileUri, fileName, fileType, fileSize } = await prepareUploadMedia(
        item.uri, item.type as "IMAGE" | "VIDEO",
      );

      const upload = await requestUploadSession(
        fileName,
        fileType,
        fileSize,
      );

      const itemProgress = (pct: number) => {
        const overall = Math.round((completedItems * itemWeight) + (pct * itemWeight / 100));
        onProgress?.(overall);
      };

      await uploadWithStrategy(upload, fileUri, fileType, fileSize, itemProgress);

      const { mediaUrl } = await confirmMediaUpload(upload.mediaId);

      completedItems++;
      onProgress?.(Math.round(completedItems * itemWeight));

      return { mediaId: upload.mediaId, mediaUrl };
    } catch (err) {
      console.error(`[preUpload] failed at index ${index}`, err);
      throw err;
    }
  });

  const mediaResults = await Promise.all(uploads);

  const mediaIds = mediaResults.map((r) => r.mediaId);
  const mediaUrls = mediaResults.map((r) => r.mediaUrl);

  await waitForMediaProcessing(mediaIds);

  return { mediaIds, mediaUrls };
}

export async function publishMediaPost(
  draft: MediaDraft,
  queryClient: QueryClient,
  onProgress?: (percent: number) => void,
  preUploaded?: { mediaIds: string[]; mediaUrls: string[] },
  lifecycle?: { assertActive: () => void; beforePublish: () => void },
) {
  if (!draft) throw new Error("Draft is missing");
  if (!draft.category?.id) throw new Error("Category is required");
  if (!draft.media?.items?.length) throw new Error("Media is required");
  lifecycle?.assertActive();

  const firstItem = draft.media.items[0];

  if (!firstItem?.type) {
    throw new Error("Invalid media item: missing type");
  }

  const derivedMediaType: "IMAGE" | "VIDEO" =
    firstItem.type === "VIDEO" ? "VIDEO" : "IMAGE";

  /* =========================
     MEDIA UPLOAD (skip if pre-uploaded)
  ========================= */

  let mediaIds: string[];
  let mediaUrls: string[];

  if (preUploaded) {
    mediaIds = preUploaded.mediaIds;
    mediaUrls = preUploaded.mediaUrls;
  } else {
    const items = draft.media.items;
    const itemWeight = 100 / items.length;
    let completedItems = 0;

    const uploads = items.map(async (item, index: number) => {
      try {
        lifecycle?.assertActive();
        const { uri: fileUri, fileName, fileType, fileSize } = await prepareUploadMedia(
          item.uri, item.type as "IMAGE" | "VIDEO",
        );
        lifecycle?.assertActive();

        const upload = await requestUploadSession(
          fileName,
          fileType,
          fileSize,
        );
        lifecycle?.assertActive();

        const itemProgress = (pct: number) => {
          const overall = Math.round((completedItems * itemWeight) + (pct * itemWeight / 100));
          onProgress?.(overall);
        };

        await uploadWithStrategy(upload, fileUri, fileType, fileSize, itemProgress);
        lifecycle?.assertActive();

        const { mediaUrl } = await confirmMediaUpload(upload.mediaId);
        lifecycle?.assertActive();

        completedItems++;
        onProgress?.(Math.round(completedItems * itemWeight));

        return { mediaId: upload.mediaId, mediaUrl };
      } catch (err) {
        console.error(`Media upload failed at index ${index}`, err);
        throw err;
      }
    });

    const mediaResults = await Promise.all(uploads);
    lifecycle?.assertActive();

    mediaIds = mediaResults.map((r) => r.mediaId);
    mediaUrls = mediaResults.map((r) => r.mediaUrl);

    await waitForMediaProcessing(mediaIds);
    lifecycle?.assertActive();
  }

  /* =========================
     FINAL PAYLOAD (FIXED)
  ========================= */

  const input: any = {
    postType: "MEDIA",
    mediaType: derivedMediaType,
    category: String(draft.category.id),
    mediaIds,
    mediaUrls,
  };

  if (draft.caption?.trim()) {
    input.caption = draft.caption;
  }

  /* =========================
     CREATE POST
  ========================= */

  try {
    lifecycle?.beforePublish();
    const response = await createMediaPost(input);

    await invalidateFeed(queryClient);

    return response;
  } catch (err) {
    console.error("CreateMediaPost failed with input:", input);
    console.error("Error:", err);
    throw err;
  }
}
