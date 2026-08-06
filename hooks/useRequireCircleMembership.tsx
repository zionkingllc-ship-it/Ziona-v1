import colors from "@/constants/colors";
import { useRef, useState } from "react";
import { router } from "expo-router";
import SuccessModal from "@/components/ui/modals/successModal";
import { useJoinCircle } from "@/hooks/useCircles";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Gates a circle interaction behind sign-in first, then membership.
 *
 * Hierarchy:
 *   1. Not signed in -> "Login" modal (login is prompted first).
 *   2. Signed in but not a member -> "Join this circle" modal.
 * On success the pending action is resumed.
 */
export function useRequireCircleMembership(circleId: string, isJoined: boolean) {
  const joinMutation = useJoinCircle();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joining, setJoining] = useState(false);
  const pendingAction = useRef<(() => void) | null>(null);

  const requireMembership = (action: () => void) => {
    if (!isAuthenticated) {
      pendingAction.current = action;
      setShowAuthModal(true);
      return;
    }
    if (!circleId || isJoined) {
      action();
      return;
    }
    pendingAction.current = action;
    setShowJoinModal(true);
  };

  const handleLogin = () => {
    setShowAuthModal(false);
    router.push("/(auth)/login/");
  };

  const handleJoin = async () => {
    if (joining) return;
    setJoining(true);
    try {
      const result = await joinMutation.mutateAsync(circleId);
      const payload = result?.joinCircle ?? result;
      if (payload?.success === false) {
        setShowJoinModal(false);
        return;
      }
      setShowJoinModal(false);
      const action = pendingAction.current;
      pendingAction.current = null;
      action?.();
    } catch (err) {
      console.error("[useRequireCircleMembership] join failed:", err);
      setShowJoinModal(false);
    } finally {
      setJoining(false);
    }
  };

  const AuthModal = (
    <SuccessModal
      visible={showAuthModal}
      onClose={() => setShowAuthModal(false)}
      title="Login Required"
      message="Please login to interact with this circle."
      type="softwarning"
      withButton
      buttonText="Login"
      buttonColor={colors.primary}
      onButtonPress={handleLogin}
      autoClose={false}
    />
  );

  const MembershipModal = (
    <SuccessModal
      visible={showJoinModal}
      onClose={() => setShowJoinModal(false)}
      title="Join this circle"
      message="Join this circle to continue."
      type="softwarning"
      withButton
      buttonText={joining ? "Joining..." : "Join"}
      buttonDisabled={joining}
      buttonColor={colors.primary}
      onButtonPress={handleJoin}
      autoClose={false}
    />
  );

  return {
    requireMembership,
    AuthModal,
    MembershipModal,
    isAuthenticated,
    isJoined,
  };
}
