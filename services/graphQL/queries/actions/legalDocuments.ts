import { graphqlRequest } from "@/services/graphQL/graphqlClient";
import type { LegalDocumentType } from "@/src/types/__generated__/graphql";

export async function fetchPrivacyPolicy(): Promise<LegalDocumentType | null> {
  const query = `
    query GetPrivacyPolicy {
      privacyPolicy {
        content
        documentUrl
        documentType
        lastUpdated
        version
      }
    }
  `;

  try {
    console.log("📄 [legalDocs] Fetching Privacy Policy...");
    const data = await graphqlRequest(query);
    console.log("📄 [legalDocs] Privacy Policy response:", JSON.stringify(data?.privacyPolicy));
    return data?.privacyPolicy ?? null;
  } catch (err) {
    console.error("📄 [legalDocs] Privacy Policy fetch failed:", err);
    return null;
  }
}

export async function fetchTermsOfService(): Promise<LegalDocumentType | null> {
  const query = `
    query GetTermsOfService {
      termsOfService {
        content
        documentUrl
        documentType
        lastUpdated
        version
      }
    }
  `;

  try {
    console.log("📄 [legalDocs] Fetching Terms of Service...");
    const data = await graphqlRequest(query);
    console.log("📄 [legalDocs] Terms of Service response:", JSON.stringify(data?.termsOfService));
    return data?.termsOfService ?? null;
  } catch (err) {
    console.error("📄 [legalDocs] Terms of Service fetch failed:", err);
    return null;
  }
}

export async function fetchCommunityGuidelines(): Promise<LegalDocumentType | null> {
  const query = `
    query GetCommunityGuidelines {
      communityGuidelines {
        content
        documentUrl
        documentType
        lastUpdated
        version
      }
    }
  `;

  try {
    console.log("📄 [legalDocs] Fetching Community Guidelines...");
    const data = await graphqlRequest(query);
    console.log("📄 [legalDocs] Community Guidelines response:", JSON.stringify(data?.communityGuidelines));
    return data?.communityGuidelines ?? null;
  } catch (err) {
    console.error("📄 [legalDocs] Community Guidelines fetch failed:", err);
    return null;
  }
}
