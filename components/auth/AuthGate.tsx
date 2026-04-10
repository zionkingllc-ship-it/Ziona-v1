import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";

type Props = {
  children: React.ReactNode;
};

export default function AuthGate({ children }: Props) {
  const initializeAuth = useAuthStore((s) => s.initializeAuth);
  const isBootstrapping = useAuthStore((s) => s.isBootstrapping);

  useEffect(() => {
    initializeAuth();
  }, []);

  if (isBootstrapping) {
    return null;
  }

  return <>{children}</>;
}
