import { useState } from "react";

export function useReportFlow() {
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [reasonsVisible, setReasonsVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  const startReport = () => setConfirmVisible(true);

  const confirmReport = () => {
    setConfirmVisible(false);
    setReasonsVisible(true);
  };

  const finishReport = () => {
    setReasonsVisible(false);
    setSuccessVisible(true);
  };

  return {
    confirmVisible,
    reasonsVisible,
    successVisible,
    startReport,
    confirmReport,
    finishReport,
    setConfirmVisible,
    setReasonsVisible,
    setSuccessVisible,
  };
}