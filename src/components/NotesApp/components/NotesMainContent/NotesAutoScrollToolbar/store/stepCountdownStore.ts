import { create } from 'zustand';

/**
 * Ephemeral (non-persisted) store for the stepped auto-scroll countdown.
 *
 * The scroll engine publishes the timestamp of the next scheduled step here,
 * and the toolbar's countdown UI reads it to render the remaining time.
 * Kept separate from the persisted settings store because this is transient
 * runtime state, not a user preference.
 */
interface StepCountdownStore {
  /** Epoch ms (performance-clock-independent Date.now) of the next step, or null when idle. */
  nextStepAt: number | null;
  /** The full wait interval (ms) for the current cycle — used for color phases. */
  intervalMs: number;
  /** Publish a newly scheduled step so the countdown can begin. */
  startCountdown: (nextStepAt: number, intervalMs: number) => void;
  /** Clear the countdown (engine stopped, paused, or reached bottom). */
  clearCountdown: () => void;
}

export const useStepCountdownStore = create<StepCountdownStore>((set) => ({
  nextStepAt: null,
  intervalMs: 0,
  startCountdown: (nextStepAt, intervalMs) => set({ nextStepAt, intervalMs }),
  clearCountdown: () => set({ nextStepAt: null, intervalMs: 0 }),
}));
