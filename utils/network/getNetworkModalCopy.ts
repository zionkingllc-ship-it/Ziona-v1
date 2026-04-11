export type NetworkModalCopy = {
  type: "warning" | "failed";
  title: string;
  message: string;
};

function getErrorMessage(error: unknown) {
  if (typeof error === "string") return error;

  if (error && typeof error === "object") {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === "string") return maybeMessage;
  }

  return "";
}

export function getNetworkModalCopy(
  error: unknown,
  fallbackMessage: string,
): NetworkModalCopy {
  const message = getErrorMessage(error).toLowerCase();

  const isNetworkError =
    message.includes("network") ||
    message.includes("internet") ||
    message.includes("timeout") ||
    message.includes("fetch") ||
    message.includes("request failed") ||
    message.includes("connection");

  if (isNetworkError) {
    return {
      type: "warning",
      title: "Network issue",
      message:
        "Your connection seems unstable. Please check your internet and try again.",
    };
  }

  return {
    type: "failed",
    title: "Something went wrong",
    message: fallbackMessage,
  };
}
