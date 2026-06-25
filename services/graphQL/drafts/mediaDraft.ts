import {
  requestMediaUpload,
  confirmMediaUpload,
  uploadFileToStorage,
  waitForMediaProcessing,
} from "../mutation/media/mediaUpload";
import { createMediaPost } from "../mutation/createPost";

import { MediaDraft } from "@/types/createPost";
import { invalidateFeed } from "@/services/feed/invalidateFeed";
import * as FileSystem from "expo-file-system/legacy";

import { QueryClient } from "@tanstack/react-query";

import { getMimeType } from "@/services/utils/mime";

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
      console.log(`[preUpload] Uploading item ${index}`, item);

      const fileName =
        item.uri?.split("/").pop() || `file-${Date.now()}-${index}`;

      const fileType = getMimeType(item.uri, item.type);

      const fileInfo = await FileSystem.getInfoAsync(item.uri);

      if (!fileInfo.exists) throw new Error("File does not exist");
      if (!fileInfo.size || fileInfo.size <= 0)
        throw new Error("Invalid file size");

      const upload = await requestMediaUpload(
        fileName,
        fileType,
        fileInfo.size,
      );

      const itemProgress = (pct: number) => {
        const overall = Math.round((completedItems * itemWeight) + (pct * itemWeight / 100));
        onProgress?.(overall);
      };

      await uploadFileToStorage(upload.uploadUrl, item.uri, fileType, itemProgress, fileInfo.size);

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
) {
  console.log("━━━━━━━━ PUBLISH MEDIA START ━━━━━━━━");
  console.log("Draft received:", draft);

  if (!draft) throw new Error("Draft is missing");
  if (!draft.category?.id) throw new Error("Category is required");
  if (!draft.media?.items?.length) throw new Error("Media is required");

  const firstItem = draft.media.items[0];

  if (!firstItem?.type) {
    throw new Error("Invalid media item: missing type");
  }

  const derivedMediaType: "IMAGE" | "VIDEO" =
    firstItem.type === "VIDEO" ? "VIDEO" : "IMAGE";

  console.log("Derived mediaType:", derivedMediaType);

  /* =========================
     MEDIA UPLOAD (skip if pre-uploaded)
  ========================= */

  let mediaIds: string[];
  let mediaUrls: string[];

  if (preUploaded) {
    mediaIds = preUploaded.mediaIds;
    mediaUrls = preUploaded.mediaUrls;
    console.log("Using pre-uploaded media:", { mediaIds, mediaUrls });
  } else {
    const items = draft.media.items;
    const itemWeight = 100 / items.length;
    let completedItems = 0;

    const uploads = items.map(async (item, index: number) => {
      try {
        console.log(`Uploading item ${index}`, item);

        const fileName =
          item.uri?.split("/").pop() || `file-${Date.now()}-${index}`;

        const fileType = getMimeType(item.uri, item.type);

        const fileInfo = await FileSystem.getInfoAsync(item.uri);

        if (!fileInfo.exists) throw new Error("File does not exist");
        if (!fileInfo.size || fileInfo.size <= 0)
          throw new Error("Invalid file size");

        const upload = await requestMediaUpload(
          fileName,
          fileType,
          fileInfo.size,
        );

        const itemProgress = (pct: number) => {
          const overall = Math.round((completedItems * itemWeight) + (pct * itemWeight / 100));
          onProgress?.(overall);
        };

        await uploadFileToStorage(upload.uploadUrl, item.uri, fileType, itemProgress, fileInfo.size);

        const { mediaUrl } = await confirmMediaUpload(upload.mediaId);

        completedItems++;
        onProgress?.(Math.round(completedItems * itemWeight));

        return { mediaId: upload.mediaId, mediaUrl };
      } catch (err) {
        console.error(`Media upload failed at index ${index}`, err);
        throw err;
      }
    });

    const mediaResults = await Promise.all(uploads);

    mediaIds = mediaResults.map((r) => r.mediaId);
    mediaUrls = mediaResults.map((r) => r.mediaUrl);

    console.log("All media uploaded. URLs:", mediaUrls);

    await waitForMediaProcessing(mediaIds);
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

  console.log("FINAL INPUT TO createMediaPost:", input);

  /* =========================
     CREATE POST
  ========================= */

  try {
    const response = await createMediaPost(input);

    console.log("Media post created successfully:", response);

    await invalidateFeed(queryClient);

    console.log("Feed invalidated");
    console.log("━━━━━━━━ PUBLISH MEDIA END ━━━━━━━━");

    return response;
  } catch (err) {
    console.error("CreateMediaPost failed with input:", input);
    console.error("Error:", err);
    throw err;
  }
}
