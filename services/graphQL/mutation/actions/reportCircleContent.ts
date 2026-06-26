import { graphqlRequest } from "@/services/graphQL/graphqlClient";

const REASON_MAP: Record<string, string> = {
  DISRESPECTFUL: "disrespectful_to_faith",
  MISUSE_SCRIPTURE: "misuse_scripture",
  ATTACKING_FAITH: "attacking_church",
  SCAM_FRAUD: "scam",
  HATE_SPEECH: "hate_speech",
  AGAINST_POLICY: "policy_violation",
  OTHER: "other",
};

export async function reportCircleContent(
  reason: string,
  circleId: string,
  targetId: string,
  targetType: string = "POST",
  description?: string,
): Promise<{ success: boolean }> {
  const mappedReason = REASON_MAP[reason] || reason;

  console.log("[ReportFlow] reportCircleContent called", {
    reason,
    mappedReason,
    circleId,
    targetId,
    targetType,
    description: description || "(none)",
  });

  const query = `
    mutation ReportCircleContent($reason: String!, $circleId: String!, $targetId: String!, $targetType: String!) {
      reportCircleContent(reason: $reason, circleId: $circleId, targetId: $targetId, targetType: $targetType) {
        success
        error {
          code
          message
        }
      }
    }
  `;

  const variables = {
    reason: mappedReason,
    circleId,
    targetId,
    targetType,
  };

  console.log("[ReportFlow] reportCircleContent sending:", JSON.stringify(variables));

  let data: any;
  try {
    data = await graphqlRequest(query, variables);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    console.error("[ReportFlow] reportCircleContent network error:", message);
    throw new Error(message);
  }

  const res = data?.reportCircleContent;
  console.log("[ReportFlow] reportCircleContent response:", JSON.stringify(res));

  if (!res?.success) {
    const errorMsg = res?.error?.message || res?.error?.code || "Failed to submit circle report";
    console.error("[ReportFlow] reportCircleContent failed:", errorMsg);
    throw new Error(errorMsg);
  }

  console.log("[ReportFlow] reportCircleContent succeeded");
  return res;
}
