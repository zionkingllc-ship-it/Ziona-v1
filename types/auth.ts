import { User } from "./user";
import { AuthTokens } from "./api";

/* ------------------- AUTH MODE ------------------- */

export type AuthMode = "authenticated" | "guest" | "unauthenticated";

/* ------------------- STORE STATE ------------------- */

export type AuthState = {
  mode: AuthMode;
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
};

/* ------------------- SIGN UP FLOW ------------------- */

export type SuggestUsernameRequest = {
  email: string;
  birthday: string;
};

export type SuggestUsernameResponse = {
  suggestions: string[];
};

export type SignUpRequest = {
  email: string;
  username: string;
  password: string;
  birthday: string;
};

export type SignUpResponse = {
  user: User;
  tokens: AuthTokens;
};

/* ------------------- SIGN IN FLOW ------------------- */

export type SignInRequest = {
  email: string;
  password: string;
};

export type SignInResponse = {
  requiresOtp: boolean;
  tempToken?: string;
  user?: User;
  tokens?: AuthTokens;
};

export type VerifyOtpRequest = {
  email: string;
  otp: string;
  tempToken?: string;
};

export type VerifyOtpResponse = {
  user: User;
  tokens: AuthTokens;
};

/* ------------------- FORGOT PASSWORD FLOW ------------------- */

export type ForgotPasswordRequest = {
  email: string;
};

export type ForgotPasswordOtpRequest = {
  email: string;
  otp: string;
};

export type ResetPasswordRequest = {
  email: string;
  otp: string;
  newPassword: string;
};