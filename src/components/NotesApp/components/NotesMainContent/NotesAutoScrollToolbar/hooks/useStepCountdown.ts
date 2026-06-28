import { useEffect, useRef, useState } from 'react';
import { useStepCountdownStore } from '../store/stepCountdownStore';
import { getCountdownPhase, type CountdownPhase } from '../utils/getCountdownPhase';

interface StepCountdownState {
  /** Whether a countdown is currently active (engine running + waiting). */
  isActive: boolean;
  /** Milliseconds remaining until the next scroll step. */
  remainingMs: number;
  /** Colour phase for the remaining time. */
  phase: CountdownPhase;
}

/**
 * Sub-hook: Drives the stepped-scroll countdown UI.
 *
 * Subscribes to the next-step timestamp published by the scroll engine and
 * ticks on requestAnimationFrame to compute the remaining time and colour
 * phase. Runs only while a countdown is active to avoid idle work.
 */
export function useStepCountdown(): StepCountdownState {
  const nextStepAt = useStepCountdownStore((s) => s.nextStepAt);
  const intervalMs = useStepCountdownStore((s) => s.intervalMs);

  const [remainingMs, setRemainingMs] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (nextStepAt === null) {
      setRemainingMs(0);
      return;
    }

    const tick = () => {
      const remaining = Math.max(0, nextStepAt - Date.now());
      setRemainingMs(remaining);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [nextStepAt]);

  const isActive = nextStepAt !== null;
  const phase = getCountdownPhase(remainingMs, intervalMs);

  return { isActive, remainingMs, phase };
}
