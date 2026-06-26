import PostComposer from "@/app/CircleExtension/PostComposer";
import { useLocalSearchParams } from "expo-router";

export default function PostComposerScreenWrapper() {
  // Extract circleId (or legacy `id`) here and pass it explicitly to the real composer component.
  // Some places use `id` and others `circleId`, so accept both.
  const { circleId, id } = useLocalSearchParams<{ circleId?: string; id?: string }>();
  const resolved = circleId ?? id ?? undefined;
  return <PostComposer initialCircleId={resolved} />;
}
