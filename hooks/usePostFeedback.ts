import { useState } from "react";
import { router } from "expo-router";

export function usePostFeedback(successRoute: string = "/(tabs)/create") {
  const [visible, setVisible] = useState(false);
  const [type, setType] = useState<"success" | "failed" | "warning">(
    "success",
  );
  const [message, setMessage] = useState("");

  function showSuccess(msg = "Post uploaded successfully") {
    setType("success");
    setMessage(msg);
    setVisible(true);
  }

  function showError(
    msg = "Something went wrong",
    feedbackType: "failed" | "warning" = "failed",
  ) {
    setType(feedbackType);
    setMessage(msg);
    setVisible(true);
  }

  function handleClose() {
    setVisible(false);

    if (type === "success") {
      router.replace(successRoute as never);
    }
  }

  return {
    visible,
    type,
    message,
    showSuccess,
    showError,
    handleClose,
  };
}
