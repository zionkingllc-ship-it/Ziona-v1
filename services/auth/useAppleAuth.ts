import { Platform } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";

import { authApi } from "@/services/api/authApi";
import { useAuthStore } from "@/store/useAuthStore";

type AppleAuthResponse = {
  user?: {
    id: string;
    username?: string | null;
  };
  tokens?: any;
  suggestedUsernames?: string[];
  error?: string;
};

const APPLE_ERROR_CODES = [
  "APPLE_NONCE_REQUIRED",
  "APPLE_NONCE_MISMATCH",
  "APPLE_NONCE_EXPIRED",
  "APPLE_EMAIL_REQUIRED",
  "INVALID_OAUTH_TOKEN",
  "APPLE_TOKEN_EXPIRED",
  "EMAIL_REGISTERED_WITH_PASSWORD",
  "EMAIL_REGISTERED_WITH_DIFFERENT_PROVIDER",
  "APPLE_ACCOUNT_MISMATCH",
  "OAUTH_NOT_CONFIGURED",
] as const;

type AppleErrorCode = (typeof APPLE_ERROR_CODES)[number];

const APPLE_ERROR_MESSAGES: Record<AppleErrorCode, string> = {
  APPLE_NONCE_REQUIRED: "Sign in could not be verified. Please try again.",
  APPLE_NONCE_MISMATCH: "Sign in could not be verified. Please try again.",
  APPLE_NONCE_EXPIRED: "Sign in timed out. Please try again.",
  APPLE_EMAIL_REQUIRED: "Email is required to sign in with Apple.",
  INVALID_OAUTH_TOKEN: "Invalid sign in token. Please try again.",
  APPLE_TOKEN_EXPIRED: "Sign in expired. Please try again.",
  EMAIL_REGISTERED_WITH_PASSWORD: "This email is already registered with a password. Please sign in with your email and password.",
  EMAIL_REGISTERED_WITH_DIFFERENT_PROVIDER: "This email is already registered with another provider.",
  APPLE_ACCOUNT_MISMATCH: "Apple account mismatch. Please use the same Apple ID.",
  OAUTH_NOT_CONFIGURED: "Apple Sign-In is not configured. Please try again later.",
};

function getUserFacingError(error: any): string {
  if (!error) return "Apple login failed, try again later.";

  if (error.errorCode && APPLE_ERROR_MESSAGES[error.errorCode as AppleErrorCode]) {
    return APPLE_ERROR_MESSAGES[error.errorCode as AppleErrorCode];
  }

  if (error._status) {
    if (error._status === 401) return "Session expired. Please try again.";
    if (error._status === 429) return "Too many attempts. Please wait and try again.";
  }

  return error?.message || "Apple login failed, try again later.";
}

export const useAppleAuth = () => {
  const setAuth = useAuthStore((s) => s.setAuth);

  const signInWithApple = async (): Promise<AppleAuthResponse> => {
    try {
      if (Platform.OS !== "ios") {
        return { error: "Apple Sign-In is only available on iOS" };
      }

      console.log("====== APPLE NONCE: requesting from backend ======");

      const { rawNonce, nonce } = await authApi.getAppleNonce();

      console.log("rawNonce:", rawNonce);
      console.log("nonce:", nonce);

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce,
      });

      const identityToken = credential?.identityToken;

      console.log("====== APPLE CREDENTIAL ======");
      console.log("identityToken length:", identityToken?.length);
      console.log("user:", credential?.user);
      console.log("email:", credential?.email);

      if (!identityToken) {
        console.error("Apple identityToken is null/undefined. Full credential:", JSON.stringify(credential));
        throw new Error("Apple Sign-In failed: No identityToken returned");
      }

      const userPayload: {
        email?: string | null;
        name?: { firstName?: string | null; lastName?: string | null };
      } = {};
      if (credential.email) userPayload.email = credential.email;
      if (credential.fullName?.givenName || credential.fullName?.familyName) {
        userPayload.name = {
          firstName: credential.fullName.givenName,
          lastName: credential.fullName.familyName,
        };
      }

      const res = await authApi.appleLogin({
        identityToken,
        rawNonce,
        nonce,
        user: credential.email || credential.fullName?.givenName || credential.fullName?.familyName
          ? userPayload
          : undefined,
      });

      const data = res?.data ?? res ?? {};

      console.log("====== APPLE LOGIN RESPONSE ======");
      console.log("success:", data.success);
      console.log("errorCode:", data.errorCode);
      console.log("hasUser:", !!data.user);
      console.log("needsUsernameSelection:", data.needsUsernameSelection);

      if (data.success === false || !data.user) {
        if (data.errorCode) {
          return { error: getUserFacingError(data) };
        }
        throw new Error("Invalid auth response");
      }

      setAuth(data.user, data.tokens);

      return {
        user: data.user,
        tokens: data.tokens,
        suggestedUsernames: data.suggestedUsernames ?? [],
      };
    } catch (error: any) {
      if (error?.code === "ERR_CANCELED") {
        return { error: "Sign in cancelled" };
      }

      console.error("Apple Sign-In error:", error);

      return {
        error: getUserFacingError(error),
      };
    }
  };

  return { signInWithApple };
};
