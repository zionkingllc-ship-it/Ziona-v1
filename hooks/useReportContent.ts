import { useMutation } from "@tanstack/react-query";
import { reportContent, ReportReason } from "@/services/graphQL/mutation/actions/report";

export function useReportContent() {
  return useMutation({
    mutationFn: ({
      reason,
      postId,
      commentId,
      description,
    }: {
      reason: ReportReason;
      postId?: string;
      commentId?: string;
      description?: string;
    }) => reportContent(reason, postId, commentId, description),
  });
}
