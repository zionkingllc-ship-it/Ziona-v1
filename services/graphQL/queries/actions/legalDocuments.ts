const BASE = process.env.EXPO_PUBLIC_LEGAL_DOCS_BASE_URL ?? "https://ziona.app";

const URLS = {
  privacy: `${BASE}/privacy`,
  termsOfService: `${BASE}/terms-of-service`,
  communityGuidelines: `${BASE}/community-guidelines`,
};

export async function fetchPrivacyPolicy() {
  return { documentUrl: URLS.privacy, content: "" };
}

export async function fetchTermsOfService() {
  return { documentUrl: URLS.termsOfService, content: "" };
}

export async function fetchCommunityGuidelines() {
  return { documentUrl: URLS.communityGuidelines, content: "" };
}
