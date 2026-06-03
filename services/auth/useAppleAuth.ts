import { Platform } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { sha256 } from "js-sha256";
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

      const rawNonce = generateNonce();
      const hashedNonce = sha256(rawNonce);

      console.log("====== APPLE NONCE ======");
      console.log("rawNonce:", rawNonce);
      console.log("hashedNonce:", hashedNonce);

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: rawNonce,
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

      const res = await authApi.appleLogin(token, hashedNonce, rawNonce);

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
