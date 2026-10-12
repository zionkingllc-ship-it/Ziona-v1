import PostComposer from "@/app/CircleExtension/PostComposer";
import { useLocalSearchParams } from "expo-router";

export default function CirclePostComposer() {
  const { circleId, id } = useLocalSearchParams<{ circleId?: string; id?: string }>();
  const resolved = circleId ?? id ?? undefined;
  return <PostComposer initialCircleId={resolved} />;
}
