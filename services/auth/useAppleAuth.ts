import { Platform } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";

import { authApi } from "@/services/api/authApi";
import { useAuthStore } from "@/store/useAuthStore";

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const decoded = atob(parts[1]);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

type AppleAuthResponse = {
  user?: {
    id: string;
    username?: string | null;
  };
  tokens?: any;
  suggestedUsernames?: string[];
  error?: string;
};

function generateNonce(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const useAppleAuth = () => {
  const setAuth = useAuthStore((s) => s.setAuth);

  const signInWithApple = async (): Promise<AppleAuthResponse> => {
    try {
      if (Platform.OS !== "ios") {
        return { error: "Apple Sign-In is only available on iOS" };
      }

      const nonce = generateNonce();

      console.log("====== APPLE NONCE ======");
      console.log("nonce:", nonce);

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce,
      });

      const token = credential?.identityToken;

      console.log("====== APPLE CREDENTIAL ======");
      console.log("credential keys:", Object.keys(credential ?? {}));
      console.log("identityToken type:", typeof token);
      console.log("identityToken length:", (token as any)?.length);
      console.log("identityToken (first 20):", token?.substring(0, 20));
      console.log("user:", credential?.user);
      console.log("email:", credential?.email);

      if (!token) {
        console.error("Apple identityToken is null/undefined. Full credential:", JSON.stringify(credential));
        throw new Error("Apple Sign-In failed: No identityToken returned");
      }

      const jwtPayload = decodeJwtPayload(token);
      const jwtNonce = jwtPayload?.nonce ?? nonce;

      console.log("====== JWT NONCE ======");
      console.log("our nonce:", nonce);
      console.log("JWT nonce:", jwtNonce);

      const res = await authApi.appleLogin(
        token,
        jwtNonce,
        jwtNonce,
        credential.email,
        credential.fullName?.givenName,
        credential.fullName?.familyName,
      );

      if (!res?.user || !res?.tokens) {
        throw new Error("Invalid auth response");
      }

      setAuth(res.user, res.tokens);
      console.log("====== APPLE DATA  ======");
      console.log("Apple User:", res.user);
      return {
        user: res.user,
        tokens: res.tokens,
        suggestedUsernames: res.suggestedUsernames ?? [],
      };
    } catch (error: any) {
      if (error?.code === "ERR_CANCELED") {
        return { error: "Sign in cancelled" };
      }

      console.error("Apple Sign-In error:", error);

      return {
        error:
          error?.error?.message ||
          error?.message ||
          "Apple login failed, try again later",
      };
    }
  };

  return { signInWithApple };
};
