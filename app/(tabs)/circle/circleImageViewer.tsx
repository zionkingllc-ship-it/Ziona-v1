import React from "react";
import CircleImageViewer from "@/app/CircleExtension/circleImageViewer";

// Thin wrapper so viewers opened from the circle tab resolve correctly.
export default function CircleImageViewerWrapper() {
  return <CircleImageViewer />;
}
