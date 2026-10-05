import { emitAppEvent } from "@/src/data/eventBus";

export function notifyUploadComplete(
  title = "Post uploaded",
  body = "Your post is now live in your feed",
) {
  emitAppEvent({
    type: "upload_completed",
    timestamp: Date.now(),
    data: { title, body },
  });
}