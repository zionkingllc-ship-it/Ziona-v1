export function signupRecovery(code?: string, pendingVerification = false) {
  if (pendingVerification || code === "OTP_EMAIL_QUEUE_FAILED") return { label: "Resend code", action: "resend" } as const;
  if (code === "EMAIL_ALREADY_REGISTERED") return { label: "Sign in", action: "signin" } as const;
  if (code === "USERNAME_TAKEN" || code === "USERNAME_RESERVED") return { label: "Choose another username", action: "edit" } as const;
  if (code === "NETWORK_ERROR") return { label: "Try again", action: "retry" } as const;
  return { label: "Edit details", action: "edit" } as const;
}
