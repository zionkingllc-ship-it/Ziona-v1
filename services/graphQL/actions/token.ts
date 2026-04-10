import { useAuthStore } from "@/store/useAuthStore";

export function getToken() {
  return useAuthStore.getState().tokens?.accessToken;
}