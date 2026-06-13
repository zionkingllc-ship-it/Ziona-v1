import { graphqlRequest } from "@/services/graphQL/graphqlClient";

export async function reportCircleContent(
  reason: string,
  circleId: string,
  targetId: string,
  targetType: string = "POST",
): Promise<{ success: boolean }> {
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

  const data = await graphqlRequest(query, { reason, circleId, targetId, targetType });
  console.log("[ReportFlow] reportCircleContent response:", JSON.stringify(data?.reportCircleContent));
  const res = data?.reportCircleContent;

  if (!res?.success) {
    throw new Error(res?.error?.message || res?.error?.code || "Failed to submit circle report");
  }

  return res;
}
