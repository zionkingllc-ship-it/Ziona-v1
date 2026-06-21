const URLS = {
  privacy: "https://ziona.app/privacy",
  termsOfService: "https://ziona.app/terms-of-service",
  communityGuidelines: "https://ziona.app/community-guidelines",
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
