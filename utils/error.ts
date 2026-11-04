export class AppError extends Error {
  public readonly code?: string;
  public readonly status?: number;
  public readonly retryable?: boolean;
  public readonly retryAfter?: string;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, options?: { code?: string; status?: number; retryable?: boolean; retryAfter?: string; details?: Record<string, unknown> }) {
    super(message);
    this.name = "AppError";
    this.code = options?.code;
    this.status = options?.status;
    this.retryable = options?.retryable;
    this.retryAfter = options?.retryAfter;
    this.details = options?.details;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function isAuthError(error: unknown): boolean {
  if (isAppError(error)) {
    if (error.code === "FORBIDDEN" || error.status === 403) return false;
    if (error.code === "UNAUTHENTICATED" || error.code === "SESSION_EXPIRED" || error.status === 401) return true;
  }
  const message = typeof error === "string" ? error : error instanceof Error ? error.message : "";
  return /unauthorized|not authenticated|authentication required|token expired|invalid token|jwt|bearer/i.test(message);
}

export function isNetworkError(error: unknown): boolean {
  if (isAppError(error)) {
    return error.name === "FetchError" || error.name === "TypeError";
  }
  if (error instanceof Error) {
    return error.name === "FetchError" || error.name === "TypeError";
  }
  return false;
}

export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}

export function getErrorTitle(error: unknown): string {
  if (isAppError(error)) {
    return error.code || "Error";
  }
  if (error instanceof Error) {
    return error.message?.split(" ")[0] || "Error";
  }
  return "Error";
}

export function shouldRetry(error: unknown): boolean {
  if (isAppError(error)) {
    return error.retryable ?? true;
  }
  return true;
}

/** Normalize the backend auth envelope without discarding machine-readable fields. */
export function normalizeRestError(error: {
  response?: { status: number; data?: any; headers?: Record<string, unknown> };
  message?: string;
}): AppError {
  const response = error.response;
  if (!response) return new AppError("Unable to connect. Check your connection and try again.", { code: "NETWORK_ERROR", retryable: true });
  const nested = response.data?.error;
  const message = typeof nested?.message === "string" ? nested.message
    : typeof response.data?.message === "string" ? response.data.message
    : response.status >= 500 ? "The service is temporarily unavailable. Please try again."
    : "Check your details and try again.";
  return new AppError(message, {
    status: response.status,
    code: typeof nested?.code === "string" ? nested.code : undefined,
    details: nested?.details,
    retryAfter: response.headers?.["retry-after"] === undefined ? undefined : String(response.headers["retry-after"]),
    retryable: response.status === 429 || response.status >= 500,
  });
}
