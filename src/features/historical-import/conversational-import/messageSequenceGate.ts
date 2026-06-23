import { useEffect, useRef, useCallback } from 'react';

export function useMessageSequenceGate() {
  const isMounted = useRef(true);
  const activeTimers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  useEffect(() => {
    isMounted.current = true;
    const timers = activeTimers.current;
    return () => {
      isMounted.current = false;
      // Cleanup all active timers to prevent memory leaks or dangling timers
      for (const timer of timers) {
        clearTimeout(timer);
      }
      timers.clear();
    };
  }, []);

  const wait = useCallback((ms: number): Promise<boolean> => {
    return new Promise(resolve => {
      if (!isMounted.current) {
        resolve(false);
        return;
      }
      const timer = setTimeout(() => {
        activeTimers.current.delete(timer);
        resolve(isMounted.current); // return false if unmounted right after timeout
      }, ms);
      activeTimers.current.add(timer);
    });
  }, []);

  const waitTypewriter = useCallback((contentLength: number, extraDelayMs: number = 600): Promise<boolean> => {
    // Typewriter velocity in ChatTimeline is 15ms per character.
    const duration = (contentLength * 15) + extraDelayMs;
    return wait(duration);
  }, [wait]);

  return { wait, waitTypewriter, isMounted };
}
