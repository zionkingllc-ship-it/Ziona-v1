import { createContext, useContext, useRef, ReactNode } from "react";

export type PressLockContextType = {
  runAndLock: (fn: () => void) => void;
  reset: () => void;
};

const PressLockContext = createContext<PressLockContextType | undefined>(
  undefined
);

export function PressLockProvider({ children }: { children: ReactNode }) {
  const lockedRef = useRef(false);

  const runAndLock = (fn: () => void) => {
    if (lockedRef.current) return;

    //  lock immediately
    lockedRef.current = true;

    fn();
  };

  const reset = () => {
    lockedRef.current = false;
  };

  return (
    <PressLockContext.Provider value={{ runAndLock, reset }}>
      {children}
    </PressLockContext.Provider>
  );
}

export function usePressLock(): PressLockContextType {
  const ctx = useContext(PressLockContext);
  if (!ctx) {
    throw new Error("usePressLock must be used inside PressLockProvider");
  }
  return ctx;
}