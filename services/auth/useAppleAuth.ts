import { Platform } from "react-native";
import { authApi } from "@/services/api/authApi";
import { useAuthStore } from "@/store/useAuthStore";

type AppleAuthResponse = {
  user?: {
    id: string;
    username?: string | null;
  };
  tokens?: any;
  error?: string;
};

export const useAppleAuth = () => {
  const setAuth = useAuthStore((s) => s.setAuth);

  const signInWithApple = async (): Promise<AppleAuthResponse> => {
    try {
      if (Platform.OS !== "ios") {
        return { error: "Apple Sign-In is only available on iOS" };
      }

      const { AppleAuthentication } = require("expo-apple-authentication");

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential?.identityToken) {
        throw new Error("Apple Sign-In failed: No identityToken returned");
      }

      console.log("====== APPLE TOKEN ======");
      console.log("Identity Token:", credential.identityToken);

      const res = await authApi.appleLogin(credential.identityToken);

      if (!res?.user || !res?.tokens) {
        throw new Error("Invalid auth response");
      }

      setAuth(res.user, res.tokens);
      console.log("====== APPLE DATA  ======");
      console.log("Apple User:", res.user);
      return {
        user: res.user,
        tokens: res.tokens,
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
