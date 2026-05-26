import { Platform } from "react-native";
import { authApi } from "@/services/api/authApi";
import { useAuthStore } from "@/store/useAuthStore";

type GoogleAuthResponse = {
  user?: {
    id: string;
    username?: string | null;
  };
  tokens?: any;
  error?: string;
};

export const useGoogleAuth = () => {
  const setAuth = useAuthStore((s) => s.setAuth);

  const initGoogleSignIn = () => {
    const { GoogleSignin } = require("@react-native-google-signin/google-signin");
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      offlineAccess: true,
      forceCodeForRefreshToken: true,
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

      console.log("====== GOOGLE TOKEN ======");
      console.log("ID Token:", idToken);
      console.log("User:", userInfo.data?.user || userInfo.user);

      if (!idToken) {
        throw new Error("Google Sign-In failed: No idToken returned");
      }

      const res = await authApi.googleLogin(idToken);

      if (!res?.user || !res?.tokens) {
        throw new Error("Invalid auth response");
      }

      setAuth(res.user, res.tokens);
      console.log("====== GOOGLE DATA  ======");
      console.log("Google ID Token:", idToken);
      console.log("Google User:", userInfo.data?.user || userInfo.user);
      return {
        user: res.user,
        tokens: res.tokens,
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
