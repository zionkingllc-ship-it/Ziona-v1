import React from "react";
import CircleVideoViewer from "@/app/CircleExtension/circleVideoViewer";

// Thin wrapper to expose the CircleExtension viewer under the circle tab route
export default function CircleVideoViewerWrapper() {
  return <CircleVideoViewer />;
}
