import Header from "@/components/layout/header";
import colors from "@/constants/colors";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, YStack } from "tamagui";
import { WebView } from "react-native-webview";

type DocType = "community" | "privacy" | "use";

const labels: Record<DocType, string> = {
  community: "Community Guidelines",
  privacy: "Privacy Policy",
  use: "Terms of Use",
};

const BASE = process.env.EXPO_PUBLIC_LEGAL_DOCS_BASE_URL ?? "https://ziona.app";

const URLS: Record<DocType, string> = {
  community: `${BASE}/community-guidelines`,
  privacy: `${BASE}/privacy`,
  use: `${BASE}/terms-of-service`,
};

export default function LegalDocumentScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const docType = type as DocType;

  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const uri = URLS[docType];
    if (!uri) {
      return;
    }
    setUrl(uri);
    setLoading(false);
  }, [docType]);

  const title = labels[docType] || "Document";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <Header heading={title} headerFontFamily="$body" headingWeight="500" />

      {loading && (
        <YStack flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color={colors.primary} />
        </YStack>
      )}

      {url && (
        <WebView
          source={{ uri: url }}
          style={{ flex: 1 }}
          startInLoadingState
          renderLoading={() => (
            <YStack flex={1} justifyContent="center" alignItems="center">
              <ActivityIndicator size="large" color={colors.primary} />
            </YStack>
          )}
        />
      )}
    </SafeAreaView>
  );
}
