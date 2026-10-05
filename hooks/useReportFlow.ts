import { useState } from "react";
import { useReportContent } from "./useReportContent";
import { ReportReason } from "@/services/graphQL/mutation/actions/report";

export function useReportFlow(postId?: string, commentId?: string) {
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [reasonsVisible, setReasonsVisible] = useState(false);
  const [otherVisible, setOtherVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const reportMutation = useReportContent();

  const startReport = () => setConfirmVisible(true);

  const confirmReport = () => {
    setConfirmVisible(false);
    setReasonsVisible(true);
  };

  const selectReason = (reason: ReportReason) => {
    setReasonsVisible(false);
    reportMutation.mutate(
      { reason, postId, commentId },
      { onSuccess: () => setSuccessVisible(true) },
    );
  };

  const selectOtherReason = (description: string) => {
    setOtherVisible(false);
    reportMutation.mutate(
      { reason: "OTHER" as ReportReason, postId, commentId, description },
      { onSuccess: () => setSuccessVisible(true) },
    );
  };

  const finishReport = () => {
    setSuccessVisible(false);
  };

  return {
    confirmVisible,
    reasonsVisible,
    otherVisible,
    successVisible,
    startReport,
    confirmReport,
    selectReason,
    selectOtherReason,
    finishReport,
    setConfirmVisible,
    setReasonsVisible,
    setOtherVisible,
    setSuccessVisible,
    isPending: reportMutation.isPending,
  };
}