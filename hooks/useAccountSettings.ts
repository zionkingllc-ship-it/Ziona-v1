import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { authApi } from "@/services/api/authApi";
import { changePassword as changePasswordMutation } from "@/services/graphQL/mutation/changePassword";
/* =========================
   CHANGE PASSWORD
 ========================= */

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: {
      currentPassword: string;
      newPassword: string;
      signOutOtherDevices?: boolean;
    }) => {
      return await changePasswordMutation(
        payload.currentPassword,
        payload.newPassword,
        payload.signOutOtherDevices ?? true,
      );
    },
  });
}

/* =========================
   DEACTIVATE ACCOUNT
 ========================= */

export function useDeactivateAccount() {
  const { clearSession } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      return await authApi.deactivateAccount();
    },
    onSuccess: async () => {
      await clearSession();
    },
  });
}

/* =========================
   DELETE ACCOUNT
 ========================= */

export function useDeleteAccount() {
  const { clearSession } = useAuthStore();

  return useMutation({
    mutationFn: async (payload: { reason: string; detail?: string; acknowledgePermanentDeletion: boolean; password: string }) => {
      return await authApi.deleteAccount(payload);
    },
    onSuccess: async () => {
      await clearSession();
    },
  });
}

/* =========================
   LOGOUT
 ========================= */

export function useLogout() {
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      try {
        await authApi.signOut();
      } catch (err) {
      }
    },
    onSuccess: async () => {
      await logout();
    },
  });
}