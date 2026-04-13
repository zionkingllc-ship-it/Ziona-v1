import colors from "@/constants/colors";
import { useState } from "react";
import { router } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import SuccessModal from "@/components/ui/modals/successModal";

export function useRequireAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const requireAuth = (action: () => void) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    action();
  };

  const handleLogin = () => {
    setShowAuthModal(false);
    router.push("/(auth)/login/");
  };

  const AuthModal = (
    <SuccessModal
      visible={showAuthModal}
      onClose={() => setShowAuthModal(false)}
      title="Login Required"
      message="Please login to interact with posts."
      type="softwarning"
      withButton
      buttonText="Login"
      buttonColor={colors.primary}
      onButtonPress={handleLogin}
      autoClose={false}
    />
  );

  return {
    requireAuth,
    AuthModal,
    isAuthenticated,
  };
}
