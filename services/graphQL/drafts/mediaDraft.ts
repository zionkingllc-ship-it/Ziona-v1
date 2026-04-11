import {
  requestMediaUpload,
  uploadFileToStorage,
} from "../mutation/media/mediaUpload";
import { createMediaPost } from "../mutation/publishMediaPost";

import { MediaDraft } from "@/types/createPost";
import { invalidateFeed } from "@/services/feed/invalidateFeed";
import * as FileSystem from "expo-file-system/legacy";

import { QueryClient } from "@tanstack/react-query";

/* =========================
   MIME TYPE
========================= */

function getMimeType(uri: string, type: "IMAGE" | "VIDEO") {
  if (type === "IMAGE") return "image/jpg";
  if (type === "VIDEO") return "video/mp4";
  return "application/octet-stream";
}

/* =========================
   EXTRACT PUBLIC URL (REAL FIX)
========================= */

function extractPublicUrl(uploadUrl: string) {
  const url = new URL(uploadUrl);

  // Example:
  // /ziona-media-dev/uploads/...mp4
  let path = url.pathname;

  // remove leading slash
  if (path.startsWith("/")) path = path.slice(1);

  return `https://storage.googleapis.com/${path}`;
}

/* =========================
   MAIN FUNCTION
========================= */

export async function publishMediaPost(
  draft: MediaDraft,
  queryClient: QueryClient,
) {
  console.log("━━━━━━━━ PUBLISH MEDIA START ━━━━━━━━");
  console.log("Draft received:", draft);

  if (!draft) throw new Error("Draft is missing");
  if (!draft.category?.id) throw new Error("Category is required");
  if (!draft.media?.items?.length) throw new Error("Media is required");

  /* =========================
     🔥 DERIVE MEDIA TYPE (SOURCE OF TRUTH FIX)
  ========================= */

  const firstItem = draft.media.items[0];

  if (!firstItem?.type) {
    throw new Error("Invalid media item: missing type");
  }

  const derivedMediaType: "IMAGE" | "VIDEO" =
    firstItem.type === "VIDEO" ? "VIDEO" : "IMAGE";

  console.log("Derived mediaType:", derivedMediaType);

  /* =========================
     MEDIA UPLOAD
  ========================= */

  const uploads = draft.media.items.map(async (item, index: number) => {
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

      await uploadFileToStorage(upload.uploadUrl, item.uri, fileType);

      const publicUrl = extractPublicUrl(upload.uploadUrl);

      return publicUrl;
    } catch (err) {
      console.error(`Media upload failed at index ${index}`, err);
      throw err;
    }
  });

  const mediaUrls = await Promise.all(uploads);

  console.log("All media uploaded. URLs:", mediaUrls);

  /* =========================
     FINAL PAYLOAD (FIXED)
  ========================= */

  const input: any = {
    postType: "MEDIA",
    mediaType: derivedMediaType, // ✅ FIXED (DO NOT TRUST draft.mediaType)
    category: String(draft.category.id),
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
