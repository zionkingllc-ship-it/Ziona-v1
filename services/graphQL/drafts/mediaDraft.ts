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
import { compressImage, convertToSupportedFormat } from "@/services/utils/imageConversion";
import { compressVideo } from "@/services/utils/videoCompression";

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
      let fileUri = item.uri;

      if (item.type === "IMAGE") {
        fileUri = await convertToSupportedFormat(fileUri, getMimeType(fileUri, "IMAGE"));
        fileUri = await compressImage(fileUri);
      } else if (item.type === "VIDEO") {
        fileUri = await compressVideo(fileUri);
      }

      const fileName =
        fileUri?.split("/").pop() || `file-${Date.now()}-${index}`;

      const fileType = getMimeType(fileUri, item.type as "IMAGE" | "VIDEO");

      const fileInfo = await FileSystem.getInfoAsync(fileUri);

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

      await uploadFileToStorage(upload.uploadUrl, fileUri, fileType, itemProgress, fileInfo.size);

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
  if (!draft) throw new Error("Draft is missing");
  if (!draft.category?.id) throw new Error("Category is required");
  if (!draft.media?.items?.length) throw new Error("Media is required");

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
        let fileUri = item.uri;

        if (item.type === "IMAGE") {
          fileUri = await convertToSupportedFormat(fileUri, getMimeType(fileUri, "IMAGE"));
          fileUri = await compressImage(fileUri);
        } else if (item.type === "VIDEO") {
          fileUri = await compressVideo(fileUri);
        }

        const fileName =
          fileUri?.split("/").pop() || `file-${Date.now()}-${index}`;

        const fileType = getMimeType(fileUri, item.type as "IMAGE" | "VIDEO");

        const fileInfo = await FileSystem.getInfoAsync(fileUri);

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

        await uploadFileToStorage(upload.uploadUrl, fileUri, fileType, itemProgress, fileInfo.size);

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

  /* =========================
     CREATE POST
  ========================= */

  try {
    const response = await createMediaPost(input);

    await invalidateFeed(queryClient);

    return response;
  } catch (err) {
    console.error("CreateMediaPost failed with input:", input);
    console.error("Error:", err);
    throw err;
  }
}
