/**
 * Visual urgency phase of the stepped-scroll countdown, driving its colour:
 * - `calm`   → white background (plenty of time left)
 * - `warn`   → orange background (getting close)
 * - `urgent` → red background (final stretch, last ~10s)
 */
export type CountdownPhase = 'calm' | 'warn' | 'urgent';

/** Absolute "last seconds" window that should always read as urgent (red). */
const URGENT_WINDOW_MS = 10000;

/**
 * Maps the remaining time until the next scroll step to a colour phase.
 *
 * The red (urgent) window is the final 10s for long intervals, but scales down
 * for short intervals so a 3s wait still cycles white -> orange -> red instead
 * of being red the entire time. Orange occupies roughly the middle third.
 *
 * @param remainingMs - Time left until the next step (ms)
 * @param intervalMs - Full wait interval for the current cycle (ms)
 * @returns The countdown colour phase
 */
export function getCountdownPhase(remainingMs: number, intervalMs: number): CountdownPhase {
  const urgentThreshold = Math.min(URGENT_WINDOW_MS, intervalMs / 3);
  const warnThreshold = Math.max(urgentThreshold, intervalMs * (2 / 3));

  if (remainingMs <= urgentThreshold) return 'urgent';
  if (remainingMs <= warnThreshold) return 'warn';
  return 'calm';
}
