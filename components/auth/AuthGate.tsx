import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";

type Props = {
  children: React.ReactNode;
};

export default function AuthGate({ children }: Props) {
  const initializeAuth = useAuthStore((s) => s.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, []);

  return <>{children}</>;
}
