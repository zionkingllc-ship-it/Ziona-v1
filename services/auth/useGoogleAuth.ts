import { authApi } from "@/services/api/authApi";
import { getGoogleAuthFailure } from "@/services/auth/googleAuthErrors";
import { useAuthStore } from "@/store/useAuthStore";
import Constants from "expo-constants";
import { Platform } from "react-native";

type GoogleAuthResponse = {
  user?: {
    id: string;
    username?: string | null;
  };
  tokens?: any;
  suggestedUsernames?: string[];
  error?: string;
  cancelled?: boolean;
};

export const useGoogleAuth = () => {
  const setAuth = useAuthStore((s) => s.setAuth);

  const initGoogleSignIn = () => {
    const {
      GoogleSignin,
    } = require("@react-native-google-signin/google-signin");
    const googleConfig = Constants.expoConfig?.extra?.google;
    const webClientId =
      googleConfig?.webClientId || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    const iosClientId =
      googleConfig?.iosClientId || process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
    console.log("[GoogleAuth] configure", {
      platform: Platform.OS,
      hasWebClientId: !!webClientId,
      hasIosClientId: !!iosClientId,
    });

    if (!webClientId) {
      throw new Error(
        "Google Sign-In is not configured: missing web client ID",
      );
    }

    GoogleSignin.configure({
      webClientId,
      iosClientId,
    });
    return GoogleSignin;
  };

  const signInWithGoogle = async (): Promise<GoogleAuthResponse> => {
    let stage = "configuration";
    try {
      const GoogleSignin = initGoogleSignIn();

      if (Platform.OS === "android") {
        stage = "play-services";
        console.log("[GoogleAuth] hasPlayServices check");
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });
        console.log("[GoogleAuth] hasPlayServices ok");
      }

      stage = "google-sign-out";
      console.log("[GoogleAuth] signOut");
      await GoogleSignin.signOut();
      console.log("[GoogleAuth] signOut ok");

      stage = "google-sign-in";
      console.log("[GoogleAuth] signIn");
      const userInfo = await GoogleSignin.signIn();
      console.log("[GoogleAuth] signIn ok", {
        hasData: !!userInfo?.data,
        hasIdToken: !!(userInfo?.data?.idToken || (userInfo as any)?.idToken),
      });

      if (!userInfo) {
        throw new Error("Invalid Google Sign-In response");
      }

      stage = "id-token";
      const idToken = userInfo.data?.idToken || (userInfo as any).idToken;

      if (!idToken) {
        throw new Error("Google Sign-In did not return an ID token");
      }

      stage = "backend";
      console.log("[GoogleAuth] backend googleLogin");
      const res = await authApi.googleLogin(idToken);
      console.log("[GoogleAuth] backend googleLogin ok", {
        status: (res as any)?.status,
        hasUser: !!res?.data?.user,
        hasTokens: !!res?.data?.tokens,
        suggestedUsernames: res?.data?.suggestedUsernames?.length ?? 0,
      });
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
      console.error("[GoogleAuth] error", {
        code: error?.code,
        message: error?.message,
        stage,
      });

      return getGoogleAuthFailure(
        error,
        stage,
        Constants.expoConfig?.android?.package,
      );
    }
  };

  return { signInWithGoogle };
};
