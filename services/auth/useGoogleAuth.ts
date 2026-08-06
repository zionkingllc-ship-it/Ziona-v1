import { Platform } from "react-native";
import { authApi } from "@/services/api/authApi";
import { useAuthStore } from "@/store/useAuthStore";

type GoogleAuthResponse = {
  user?: {
    id: string;
    username?: string | null;
  };
  tokens?: any;
  suggestedUsernames?: string[];
  error?: string;
};

export const useGoogleAuth = () => {
  const setAuth = useAuthStore((s) => s.setAuth);

  const initGoogleSignIn = () => {
    const { GoogleSignin } = require("@react-native-google-signin/google-signin");
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    });
    return GoogleSignin;
  };

  const signInWithGoogle = async (): Promise<GoogleAuthResponse> => {
    try {
      const GoogleSignin = initGoogleSignIn();

      if (Platform.OS === "android") {
        await GoogleSignin.hasPlayServices();
      }

      await GoogleSignin.signOut();

      const userInfo = await GoogleSignin.signIn();

      if (!userInfo) {
        throw new Error("Invalid Google Sign-In response");
      }

      const idToken = userInfo.data?.idToken || (userInfo as any).idToken;

      if (!idToken) {
        throw new Error("Google Sign-In failed: No idToken returned");
      }

      const res = await authApi.googleLogin(idToken);
      const data = res?.data ?? res ?? {};

      if (!data?.user || !data?.tokens) {
        throw new Error("Invalid auth response");
      }

      setAuth(data.user, data.tokens);
      return {
        user: data.user,
        tokens: data.tokens,
        suggestedUsernames: data.suggestedUsernames ?? [],
      };
    } catch (error: any) {
      console.error("Google Sign-In error:", error);

      return {
        error:
          error?.error?.message ||
          error?.message ||
          "Google login failed, try again later",
      };
    }
  };

  return { signInWithGoogle };
};
