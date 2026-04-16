import { graphqlRequest } from "@/services/graphQL/graphqlClient";

export type ReportReason =
  | "DISRESPECTFUL"
  | "MISUSE_SCRIPTURE"
  | "ATTACKING_FAITH"
  | "SCAM_FRAUD"
  | "HATE_SPEECH"
  | "AGAINST_POLICY"
  | "OTHER";

export const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
  { value: "DISRESPECTFUL", label: "Disrespectful to Christian beliefs", description: "" },
  { value: "MISUSE_SCRIPTURE", label: "Misuse of scripture or preaching harmful doctrine", description: "" },
  { value: "ATTACKING_FAITH", label: "Attacking a church, pastor, or faith group", description: "" },
  { value: "SCAM_FRAUD", label: "Scam or fraud", description: "" },
  { value: "HATE_SPEECH", label: "Hate speech or discrimination", description: "" },
  { value: "AGAINST_POLICY", label: "Restricted or against policy content", description: "" },
  { value: "OTHER", label: "Other", description: "" },
];

export async function reportContent(
  reason: ReportReason,
  postId?: string,
  commentId?: string
): Promise<{ success: boolean; report?: { id: string; status: string } }> {
  const query = `
    mutation ReportContent($reason: String!, $postId: String, $commentId: String) {
      reportContent(reason: $reason, postId: $postId, commentId: $commentId) {
        success
        report {
          id
          status
        }
        error {
          code
          message
        }
      }
    }
  `;

  const data = await graphqlRequest(query, { reason, postId, commentId });

  const res = data?.reportContent;

  if (!res?.success) {
    throw new Error(res?.error?.message || "Failed to submit report");
  }

  return res;
}
