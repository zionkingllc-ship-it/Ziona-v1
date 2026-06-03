import Header from "@/components/layout/header";
import colors from "@/constants/colors";
import { fetchCommunityGuidelines, fetchPrivacyPolicy, fetchTermsOfService } from "@/services/graphQL/queries/actions/legalDocuments";
import type { LegalDocumentType } from "@/src/types/__generated__/graphql";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, XStack, YStack } from "tamagui";
import { WebView } from "react-native-webview";
import * as WebBrowser from "expo-web-browser";

type DocType = "community" | "privacy" | "use";

const labels: Record<DocType, string> = {
  community: "Community Guidelines",
  privacy: "Privacy Policy",
  use: "Terms of Use",
};

const fetchers: Record<DocType, () => Promise<LegalDocumentType | null>> = {
  community: fetchCommunityGuidelines,
  privacy: fetchPrivacyPolicy,
  use: fetchTermsOfService,
};

function isUrl(str: string) {
  return /^https?:\/\//i.test(str.trim());
}

export default function LegalDocumentScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const docType = type as DocType;

  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [webviewError, setWebviewError] = useState(false);

  useEffect(() => {
    const fetcher = fetchers[docType];
    if (!fetcher) {
      setError(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    fetcher()
      .then((doc) => {
        const url = doc?.documentUrl || doc?.content || null;
        console.log(`📄 [type.tsx] documentUrl="${doc?.documentUrl}", content="${doc?.content?.substring(0, 80)}"`);
        if (url) {
          setContent(url);
        } else {
          console.warn(`📄 [type.tsx] No documentUrl or content for "${type}"`);
          setError(true);
        }
      })
      .catch((err) => {
        console.error(`📄 [type.tsx] Fetcher threw:`, err);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [type, docType]);

  const title = labels[docType] || "Document";
  const isPdfUrl = content ? isUrl(content) : false;

  const pdfUri = Platform.OS === "android" && content
    ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(content)}`
    : content;

  const handleOpenInBrowser = async () => {
    if (content) {
      await WebBrowser.openBrowserAsync(content);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <Header heading={title} headerFontFamily="$body" headingWeight="500" />

      {loading && (
        <YStack flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color={colors.primary} />
        </YStack>
      )}

      {error && !loading && (
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
          <Text fontFamily="$body" fontSize={14} color={colors.gray} textAlign="center">
            Unable to load {title.toLowerCase()}. Please try again later.
          </Text>
        </YStack>
      )}

      {content && !loading && !isPdfUrl && (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text fontFamily="$body" fontSize={14} color={colors.black} lineHeight={22}>
            {content}
          </Text>
        </ScrollView>
      )}

      {isPdfUrl && !webviewError && (
        <WebView
          source={{ uri: pdfUri! }}
          style={{ flex: 1 }}
          startInLoadingState
          onError={() => setWebviewError(true)}
          renderLoading={() => (
            <YStack flex={1} justifyContent="center" alignItems="center">
              <ActivityIndicator size="large" color={colors.primary} />
            </YStack>
          )}
        />
      )}

      {webviewError && (
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" gap="$4">
          <Text fontFamily="$body" fontSize={14} color={colors.gray} textAlign="center">
            Unable to display the document inline.
          </Text>
          <TouchableOpacity
            onPress={handleOpenInBrowser}
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
            }}
          >
            <Text fontFamily="$body" fontSize={14} color={colors.white} fontWeight="600">
              Open in browser
            </Text>
          </TouchableOpacity>
        </YStack>
      )}
    </SafeAreaView>
  );
}
