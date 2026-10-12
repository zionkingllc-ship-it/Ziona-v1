import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function AuthGate({ children }: Props) {
  // Auth is initialized in app/_layout.tsx — no duplicate call needed.
  return <>{children}</>;
}
