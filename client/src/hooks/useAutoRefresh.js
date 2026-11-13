import { useEffect, useRef } from 'react';

/**
 * Custom hook that sets up an auto-refresh interval.
 * Calls the provided callback at the specified interval.
 * Automatically cleans up on unmount or when dependencies change.
 *
 * @param {Function} callback - Function to call on each interval tick
 * @param {number} intervalMs - Interval in milliseconds (0 or null to disable)
 * @param {boolean} enabled - Whether auto-refresh is currently enabled
 */
export function useAutoRefresh(callback, intervalMs, enabled = true) {
  const savedCallback = useRef(callback);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || !intervalMs || intervalMs <= 0) return;

    const id = setInterval(() => {
      savedCallback.current();
    }, intervalMs);

    return () => clearInterval(id);
  }, [intervalMs, enabled]);
}
