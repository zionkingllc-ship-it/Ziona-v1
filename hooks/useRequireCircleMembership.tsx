import colors from "@/constants/colors";
import { useRef, useState } from "react";
import SuccessModal from "@/components/ui/modals/successModal";
import { useJoinCircle } from "@/hooks/useCircles";

/**
 * Gates a circle interaction behind membership. If the user has not joined
 * the circle, shows a "Join this circle to continue" modal; on success the
 * pending action is resumed.
 */
export function useRequireCircleMembership(circleId: string, isJoined: boolean) {
  const joinMutation = useJoinCircle();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joining, setJoining] = useState(false);
  const pendingAction = useRef<(() => void) | null>(null);

  const requireMembership = (action: () => void) => {
    if (!circleId || isJoined) {
      action();
      return;
    }
    pendingAction.current = action;
    setShowJoinModal(true);
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
    MembershipModal,
    isJoined,
  };
}
