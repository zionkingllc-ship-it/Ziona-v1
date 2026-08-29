import React from "react";
import { Dimensions } from "react-native";
import RenderHtml, {
  MixedStyleDeclaration,
} from "react-native-render-html";

type AnchorHtmlTextProps = {
  html?: string;
  contentWidth?: number;
  baseStyle?: MixedStyleDeclaration;
};

const baseTextStyle: MixedStyleDeclaration = {
  fontSize: 16,
  lineHeight: 26,
  color: "#333",
  textAlign: "center",
};

const tagsStyle: Record<string, MixedStyleDeclaration> = {
  a: { color: "#6C2BD9" },
  strong: { fontWeight: "700" },
  b: { fontWeight: "700" },
  em: { fontStyle: "italic" },
  i: { fontStyle: "italic" },
  h1: { fontSize: 24, fontWeight: "700", marginVertical: 8, textAlign: "center" },
  h2: { fontSize: 20, fontWeight: "700", marginVertical: 6, textAlign: "center" },
  h3: { fontSize: 18, fontWeight: "700", marginVertical: 4, textAlign: "center" },
  p: { marginVertical: 6, textAlign: "center" },
  ul: { marginVertical: 6 },
  ol: { marginVertical: 6 },
  li: { marginVertical: 2, textAlign: "left" },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: "#69586E",
    paddingLeft: 12,
    fontStyle: "italic",
    color: "#555",
    textAlign: "left",
  },
};

export default function AnchorHtmlText({
  html,
  contentWidth,
  baseStyle,
}: AnchorHtmlTextProps) {
  if (!html) return null;

  const width = contentWidth ?? Dimensions.get("window").width - 32;

  return (
    <RenderHtml
      contentWidth={width}
      source={{ html }}
      baseStyle={{ ...baseTextStyle, ...baseStyle }}
      tagsStyles={tagsStyle}
      enableExperimentalBRCollapsing
    />
  );
}
