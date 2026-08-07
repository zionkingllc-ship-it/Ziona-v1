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
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
    console.log("[GoogleAuth] configure", {
      platform: Platform.OS,
      webClientId,
      iosClientId,
      hasWebClientId: !!webClientId,
      hasIosClientId: !!iosClientId,
    });
    GoogleSignin.configure({
      webClientId,
      iosClientId,
    });
    return GoogleSignin;
  };

  const signInWithGoogle = async (): Promise<GoogleAuthResponse> => {
    try {
      const GoogleSignin = initGoogleSignIn();

      if (Platform.OS === "android") {
        console.log("[GoogleAuth] hasPlayServices check");
        await GoogleSignin.hasPlayServices();
        console.log("[GoogleAuth] hasPlayServices ok");
      }

      console.log("[GoogleAuth] signOut");
      await GoogleSignin.signOut();
      console.log("[GoogleAuth] signOut ok");

      console.log("[GoogleAuth] signIn");
      const userInfo = await GoogleSignin.signIn();
      console.log("[GoogleAuth] signIn ok", {
        hasData: !!userInfo?.data,
        hasIdToken: !!(
          userInfo?.data?.idToken ||
          (userInfo as any)?.idToken
        ),
        userId: userInfo?.data?.user?.id,
      });

      if (!userInfo) {
        throw new Error("Invalid Google Sign-In response");
      }

      const idToken = userInfo.data?.idToken || (userInfo as any).idToken;

      if (!idToken) {
        throw new Error("Google Sign-In failed: No idToken returned");
      }

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
        userInfo:
          error?.nativeStackAndroid?.userInfo ??
          error?.nativeStackIOS?.userInfo ??
          error?.userInfo,
        stage: error?.stage,
        raw: error,
      });

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
