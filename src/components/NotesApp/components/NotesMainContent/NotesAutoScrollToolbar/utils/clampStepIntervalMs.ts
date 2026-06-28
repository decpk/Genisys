import { MIN_STEP_INTERVAL_MS, MAX_STEP_INTERVAL_MS } from './autoScrollConstants';

/**
 * Clamps a step wait interval (ms) to the valid range [MIN, MAX].
 * Used to validate slider input for stepped scroll mode.
 *
 * @param intervalMs - Requested wait interval between steps, in milliseconds
 * @returns Clamped interval in milliseconds
 */
export function clampStepIntervalMs(intervalMs: number): number {
  return Math.max(MIN_STEP_INTERVAL_MS, Math.min(MAX_STEP_INTERVAL_MS, Math.round(intervalMs)));
}
