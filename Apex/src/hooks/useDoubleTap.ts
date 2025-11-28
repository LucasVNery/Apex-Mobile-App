import { useRef, useCallback } from 'react';

interface UseDoubleTapOptions {
  onSingleTap?: () => void;
  onDoubleTap?: () => void;
  delay?: number;
}

export function useDoubleTap({ onSingleTap, onDoubleTap, delay = 300 }: UseDoubleTapOptions) {
  const lastTapRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTap = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < delay && timeSinceLastTap > 0) {
      // É um double tap
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      lastTapRef.current = 0;
      onDoubleTap?.();
    } else {
      // Pode ser um single tap, aguarda para confirmar
      lastTapRef.current = now;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        onSingleTap?.();
        timeoutRef.current = null;
      }, delay);
    }
  }, [onSingleTap, onDoubleTap, delay]);

  return handleTap;
}
