import { useEffect, useRef } from "react";

/**
 * Hook that tracks whether the component is mounted
 * Useful for preventing state updates after component unmount
 * @returns A function that returns true if the component is still mounted
 */
export function useIsMounted(): () => boolean {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return () => isMountedRef.current;
}

