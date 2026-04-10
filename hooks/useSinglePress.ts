import { useCallback, useRef } from "react";

type Options = {
  /** Auto-unlock after N ms (optional) */
  timeout?: number;
};

export function useSinglePress(options?: Options) {
  const locked = useRef(false);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const run = useCallback(
    (fn: () => void) => {
      if (locked.current) return;

      locked.current = true;
      fn();

      if (options?.timeout) {
        timer.current = setTimeout(() => {
          locked.current = false;
        }, options.timeout);
      }
    },
    [options?.timeout]
  );

  const reset = useCallback(() => {
    locked.current = false;
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  return { run, reset };
}