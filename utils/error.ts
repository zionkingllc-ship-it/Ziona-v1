export class AppError extends Error {
  public readonly code?: string;
  public readonly status?: number;
  public readonly retryable?: boolean;

  constructor(message: string, options?: { code?: string; status?: number; retryable?: boolean }) {
    super(message);
    this.name = "AppError";
    this.code = options?.code;
    this.status = options?.status;
    this.retryable = options?.retryable;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function isAuthError(error: unknown): boolean {
  if (isAppError(error)) {
    return (
      error.code === "UNAUTHENTICATED" ||
      error.code === "FORBIDDEN" ||
      /unauthorized|not authenticated|authentication required|token expired|invalid token|jwt|bearer/i.test(error.message)
    );
  }
  if (error instanceof Error) {
    return (
      error.code === "UNAUTHENTICATED" ||
      error.code === "FORBIDDEN" ||
      /unauthorized|not authenticated|authentication required|token expired|invalid token|jwt|bearer/i.test(error.message)
    );
  }
  return false;
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
  if (error instanceof Error) {
    return error.retryable ?? true;
  }
  return true;
}