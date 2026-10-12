const MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/jpeg",
  heif: "image/jpeg",
  gif: "image/gif",
  mp4: "video/mp4",
  mov: "video/quicktime",
  m4v: "video/mp4",
  avi: "video/x-msvideo",
};

function getExtension(uri: string): string {
  const match = uri.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/);
  return match?.[1]?.toLowerCase() ?? "";
}

export function getMimeType(uri: string, type: "IMAGE" | "VIDEO"): string {
  const ext = getExtension(uri);
  if (ext && MIME_MAP[ext]) return MIME_MAP[ext];
  if (type === "IMAGE") return "image/jpeg";
  if (type === "VIDEO") return "video/mp4";
  return "application/octet-stream";
}
