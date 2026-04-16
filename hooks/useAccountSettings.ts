import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { authApi } from "@/services/api/authApi";

/* =========================
   CHANGE PASSWORD
 ========================= */

export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      currentPassword: string;
      newPassword: string;
    }) => {
      return await authApi.changePassword(payload);
    },
    onSuccess: () => {
      // Optionally clear sensitive data or show success
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
    mutationFn: async () => {
      return await authApi.deleteAccount();
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
      await authApi.signOut();
    },
    onSuccess: async () => {
      await logout();
    },
  });
}