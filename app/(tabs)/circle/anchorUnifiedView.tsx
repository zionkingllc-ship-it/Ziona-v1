import React from "react";
import AnchorUnifiedView from "@/app/CircleExtension/anchorUnifiedView";

// Thin wrapper so AnchorUnifiedView can be opened from the circle tab navigator
export default function AnchorUnifiedViewWrapper() {
  return <AnchorUnifiedView />;
}
