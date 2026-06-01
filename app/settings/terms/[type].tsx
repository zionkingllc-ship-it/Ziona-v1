import Header from "@/components/layout/header";
import colors from "@/constants/colors";
import { fetchCommunityGuidelines, fetchPrivacyPolicy, fetchTermsOfService } from "@/services/graphQL/queries/actions/legalDocuments";
import type { LegalDocumentType } from "@/src/types/__generated__/graphql";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, XStack, YStack } from "tamagui";
import { WebView } from "react-native-webview";

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
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
        if (doc?.content) {
          setContent(doc.content);
          setLastUpdated(doc.lastUpdated);
        } else {
          setError(true);
        }
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [docType]);

  const title = labels[docType] || "Document";
  const isPdfUrl = content ? isUrl(content) : false;

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
          {lastUpdated && (
            <Text fontFamily="$body" fontSize={12} color={colors.gray} marginBottom={16}>
              Last updated: {new Date(lastUpdated).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          )}
          <Text fontFamily="$body" fontSize={14} color={colors.black} lineHeight={22}>
            {content}
          </Text>
        </ScrollView>
      )}

      {isPdfUrl && (
        <WebView
          source={{ uri: content! }}
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
