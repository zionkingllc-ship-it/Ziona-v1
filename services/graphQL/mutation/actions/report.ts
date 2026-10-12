import { graphqlRequest } from "@/services/graphQL/graphqlClient";
import { AppError } from "@/utils/error";

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

const REASON_MAP: Record<ReportReason, string> = {
  DISRESPECTFUL: "disrespectful_to_faith",
  MISUSE_SCRIPTURE: "misuse_scripture",
  ATTACKING_FAITH: "attacking_church",
  SCAM_FRAUD: "scam",
  HATE_SPEECH: "hate_speech",
  AGAINST_POLICY: "policy_violation",
  OTHER: "other",
};

export async function reportContent(
  reason: ReportReason,
  postId?: string,
  commentId?: string,
  description?: string
): Promise<{ success: boolean; report?: { id: string; status: string } }> {
  const mappedReason = REASON_MAP[reason];

  const query = `
    mutation ReportContent($reason: String!, $postId: String, $commentId: String, $description: String) {
      reportContent(reason: $reason, postId: $postId, commentId: $commentId, description: $description) {
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

  const data = await graphqlRequest(query, { reason: mappedReason, postId, commentId, description });

  const res = data?.reportContent;

  if (!res?.success) {
    throw new AppError(res?.error?.message || "Failed to submit report", { code: res?.error?.code });
  }

  return res;
}
