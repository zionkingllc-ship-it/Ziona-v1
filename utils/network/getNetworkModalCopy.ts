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

  const isOfflineError =
    message.includes("network request failed") ||
    message.includes("network error") ||
    message.includes("failed to fetch") ||
    message.includes("fetch error") ||
    message.includes("enotfound") ||
    message.includes("eai_again") ||
    message.includes("socket hang up") ||
    message.includes("aborted") ||
    message.includes("connection refused") ||
    message.includes("no connection") ||
    message.includes("connection lost") ||
    message.includes("not connected") ||
    message.includes("internet") ||
    (error instanceof TypeError && message.includes("undefined")) ||
    (error instanceof TypeError && message.includes("null"));

  if (isOfflineError) {
    return {
      type: "warning",
      title: "No Connection",
      message:
        "Your device appears to be offline. Please check your Wi-Fi or mobile data and try again.",
    };
  }

  const isWeakSignal =
    message.includes("timeout") ||
    message.includes("slow") ||
    message.includes("unstable");

  if (isWeakSignal) {
    return {
      type: "warning",
      title: "Weak Connection",
      message:
        "Your connection seems unstable. Please try again when your signal improves.",
    };
  }

  const isServerBusy =
    message.includes("max requests") ||
    message.includes("limit exceeded") ||
    message.includes("server busy") ||
    message.includes("too many requests");

  if (isServerBusy) {
    return {
      type: "warning",
      title: "Server Busy",
      message:
        "The server is experiencing high demand. Please try again in a few moments.",
    };
  }

  const isValidationError =
    message.includes("video duration") ||
    message.includes("duration exceeds") ||
    message.includes("90-second") ||
    message.includes("exceeds the limit") ||
    message.includes("validation_error") ||
    message.includes("validation error") ||
    message.includes("file type") ||
    message.includes("image type") ||
    message.includes("unsupported") ||
    message.includes("invalid format") ||
    message.includes("invalid image") ||
    message.includes("invalid file") ||
    message.includes("not supported") ||
    message.includes("not allowed");

  if (isValidationError) {
    return {
      type: "failed",
      title: "Unable to Upload",
      message: fallbackMessage,
    };
  }

  return {
    type: "failed",
    title: "Something went wrong",
    message: fallbackMessage,
  };
}
