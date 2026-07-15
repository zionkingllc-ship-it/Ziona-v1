export interface PostCoverData {
  postType: string;
  textMessage?: string;
  scriptureText?: string;
  bgColor: string;
}

type ParsedCover =
  | { type: "post"; data: PostCoverData }
  | { type: "image"; uri: string | null };

export function parseCover(cover?: string): ParsedCover {
  if (cover && cover.startsWith("__post__:")) {
    try {
      const json = cover.substring("__post__:".length);
      const data: PostCoverData = JSON.parse(json);
      return { type: "post", data };
    } catch {
      return { type: "image", uri: null };
    }
  }

  return { type: "image", uri: cover || null };
}
