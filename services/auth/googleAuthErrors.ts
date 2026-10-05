type GoogleSignInFailure = {
  code?: string | number;
  message?: string;
  status?: number;
  response?: { status?: number };
};

export type GoogleAuthFailureResult = {
  error?: string;
  cancelled?: boolean;
};

export function getGoogleAuthFailure(
  error: unknown,
  stage: string,
  androidPackage?: string,
): GoogleAuthFailureResult {
  const failure = (error ?? {}) as GoogleSignInFailure;
  const code = String(failure.code ?? "").toUpperCase();

  if (["SIGN_IN_CANCELLED", "12501", "ERR_CANCELED"].includes(code)) {
    return { cancelled: true };
  }

  if (["10", "DEVELOPER_ERROR"].includes(code)) {
    const packageText = androidPackage ? ` (${androidPackage})` : "";
    return {
      error: `Google Sign-In is not configured for this build${packageText}. Register its package and signing SHA-1 in Firebase/Google Cloud (Play App Signing for Play installs; EAS keystore for direct installs), then rebuild with the updated Firebase config.`,
    };
  }

  if (["PLAY_SERVICES_NOT_AVAILABLE", "SERVICE_NOT_AVAILABLE"].includes(code)) {
    return {
      error:
        "Google Play services is missing or out of date. Update it and try again.",
    };
  }

  if (["NETWORK_ERROR", "7"].includes(code)) {
    return {
      error:
        "Google Sign-In could not connect. Check your internet connection and try again.",
    };
  }

  if (stage === "id-token") {
    return {
      error:
        "Google did not return a sign-in token. Check that this build uses the correct Google web client ID.",
    };
  }

  const backendStatus = failure.status ?? failure.response?.status;
  if (stage === "backend" && (backendStatus === 401 || backendStatus === 403)) {
    return {
      error:
        "Google Sign-In completed, but the server rejected the account. Check the staging OAuth client configuration or try another sign-in method.",
    };
  }

  return {
    error:
      (typeof failure.message === "string" && failure.message.trim()) ||
      "Google Sign-In could not be completed. Please try again or use email sign-in.",
  };
}
