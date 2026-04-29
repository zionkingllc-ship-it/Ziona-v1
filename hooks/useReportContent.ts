import { useMutation } from "@tanstack/react-query";
import { reportContent, ReportReason } from "@/services/graphQL/mutation/actions/report";

export function useReportContent() {
  return useMutation({
    mutationFn: ({
      reason,
      postId,
      commentId,
    }: {
      reason: ReportReason;
      postId?: string;
      commentId?: string;
    }) => reportContent(reason, postId, commentId),
  });
}
