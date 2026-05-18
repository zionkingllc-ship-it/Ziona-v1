import { graphqlRequest } from "@/services/graphQL/graphqlClient";
import type { LegalDocumentType } from "@/src/types/__generated__/graphql";

export async function fetchPrivacyPolicy(): Promise<LegalDocumentType | null> {
  const query = `
    query GetPrivacyPolicy {
      privacyPolicy {
        content
        lastUpdated
        version
      }
    }
  `;

  try {
    const data = await graphqlRequest(query);
    return data?.privacyPolicy ?? null;
  } catch {
    return null;
  }
}

export async function fetchTermsOfService(): Promise<LegalDocumentType | null> {
  const query = `
    query GetTermsOfService {
      termsOfService {
        content
        lastUpdated
        version
      }
    }
  `;

  try {
    const data = await graphqlRequest(query);
    return data?.termsOfService ?? null;
  } catch {
    return null;
  }
}

export async function fetchCommunityGuidelines(): Promise<LegalDocumentType | null> {
  const query = `
    query GetCommunityGuidelines {
      communityGuidelines {
        content
        lastUpdated
        version
      }
    }
  `;

  try {
    const data = await graphqlRequest(query);
    return data?.communityGuidelines ?? null;
  } catch {
    return null;
  }
}
